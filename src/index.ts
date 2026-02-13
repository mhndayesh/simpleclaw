import { Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv';
import { OllamaProvider } from './providers/ollama.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { HuggingFaceProvider } from './providers/huggingface.js';
import type { Provider, ModelMetadata, ChatMessage } from './providers/types.js';
import { SessionMemory } from './core/memory.js';
import { getSystemPrompt } from './core/identity.js';
import { extractCommands, executeTool, extractWriteCommands, writeTool } from './core/tools.js';
import { ConfigManager } from './core/config.js';
import { getProjectRoot } from './core/paths.js';
import type { AppConfig, ModelPreference } from './core/config.js';

dotenv.config();

const program = new Command();

program
    .name('simpleclaw')
    .description('A minimalist AI gateway for local and remote models')
    .version('1.0.0');

async function getProviders(): Promise<Provider[]> {
    const providers: Provider[] = [new OllamaProvider()];

    if (process.env.OPENROUTER_API_KEY) {
        providers.push(new OpenRouterProvider(process.env.OPENROUTER_API_KEY));
    }

    if (process.env.HF_API_KEY) {
        providers.push(new HuggingFaceProvider(process.env.HF_API_KEY));
    }

    return providers;
}

program
    .command('list')
    .description('List available models')
    .action(async () => {
        console.log(chalk.blue('Discovering models...'));
        const providers = await getProviders();
        const allModels: ModelMetadata[] = [];

        for (const provider of providers) {
            try {
                const models = await provider.discoverModels();
                allModels.push(...models);
            } catch (err: any) {
                console.error(chalk.red(`Failed to discover models for ${provider.id}: ${err.message}`));
            }
        }

        if (allModels.length === 0) {
            console.log(chalk.red('No models found. Make sure Ollama is running or API keys are set.'));
            return;
        }

        console.log(chalk.green(`Found ${allModels.length} models:`));
        allModels.forEach(m => {
            console.log(`- ${chalk.yellow(m.id)} (${m.provider})`);
        });
    });

program
    .command('config')
    .description('Manage model configuration (primary/fallback)')
    .option('--primary <modelId>', 'Set primary model')
    .option('--fallback <modelId>', 'Set fallback model')
    .action(async (options) => {
        const configManager = new ConfigManager();
        const config = await configManager.load();
        const providers = await getProviders();
        const allModels: ModelMetadata[] = [];

        for (const p of providers) {
            allModels.push(...(await p.discoverModels()));
        }

        if (options.primary) {
            const found = allModels.find(m => m.id === options.primary);
            if (!found) return console.error(chalk.red(`Model ${options.primary} not found.`));
            config.primary = { provider: found.provider, model: found.id };
            console.log(chalk.green(`Set primary model to ${found.id} (${found.provider})`));
        }

        if (options.fallback) {
            const found = allModels.find(m => m.id === options.fallback);
            if (!found) return console.error(chalk.red(`Model ${options.fallback} not found.`));
            config.fallback = { provider: found.provider, model: found.id };
            console.log(chalk.green(`Set fallback model to ${found.id} (${found.provider})`));
        }

        if (!options.primary && !options.fallback) {
            console.log(chalk.blue('Current Config:'));
            console.log(JSON.stringify(config, null, 2));
        } else {
            await configManager.save(config);
        }
    });

program
    .command('chat')
    .description('Send a message to a model')
    .option('-m, --model <id>', 'Model ID to use')
    .option('-s, --session <id>', 'Session ID for memory', 'default')
    .requiredOption('-q, --query <text>', 'The message to send')
    .action(async (options) => {
        const configManager = new ConfigManager();
        const config = await configManager.load();
        const providers = await getProviders();

        let modelId = options.model || config.primary?.model;
        if (!modelId) {
            console.log(chalk.red('No model specified and no default primary model set in config.'));
            return;
        }

        async function attemptChat(currentModelId: string, isFallback: boolean = false): Promise<boolean> {
            let selectedModel: ModelMetadata | undefined;
            let selectedProvider: Provider | undefined;

            for (const provider of providers) {
                const models = await provider.discoverModels();
                const found = models.find(m => m.id === currentModelId);
                if (found) {
                    selectedModel = found;
                    selectedProvider = provider;
                    break;
                }
            }

            if (!selectedProvider || !selectedModel) {
                if (!isFallback) console.log(chalk.yellow(`Model "${currentModelId}" not found.`));
                return false;
            }

            // Memory & Identity
            const memory = new SessionMemory(options.session);
            await memory.load();

            if (memory.getHistory().length === 0) {
                memory.addMessage({ role: 'system', content: getSystemPrompt() });
            }

            // Only add user query on the first attempt if it's NOT already in history
            const history = memory.getHistory();
            const lastMessage = history[history.length - 1];
            if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== options.query) {
                memory.addMessage({ role: 'user', content: options.query });
            }

            console.log(chalk.blue(`${isFallback ? 'FALLBACK: ' : ''}Sending message to ${selectedModel.id} via ${selectedModel.provider}...`));

            try {
                let turn = 0;
                const maxTurns = 5;

                while (turn < maxTurns) {
                    const response = await selectedProvider.chat(selectedModel.id, memory.getHistory());
                    console.log(chalk.white('\n--- Assistant ---'));
                    console.log(response.content);
                    memory.addMessage({ role: 'assistant', content: response.content });

                    const writeCommands = extractWriteCommands(response.content);
                    if (writeCommands.length > 0) {
                        console.log(chalk.cyan(`\nAgent requested ${writeCommands.length} write operation(s).`));
                        for (const cmd of writeCommands) {
                            const result = await writeTool(cmd.path, cmd.content);
                            console.log(chalk.gray(`\n[Result]: ${result}`));
                            memory.addMessage({ role: 'user', content: `Write result for "${cmd.path}": ${result}` });
                        }
                        turn++;
                        continue;
                    }

                    const commands = extractCommands(response.content);
                    if (commands.length > 0) {
                        console.log(chalk.yellow(`\nAgent requested ${commands.length} tool(s).`));
                        for (const cmd of commands) {
                            const result = await executeTool(cmd);
                            console.log(chalk.gray(`\n[Result]: ${result.trim()}`));
                            memory.addMessage({ role: 'user', content: `Tool result for "${cmd}":\n${result}` });
                        }
                        turn++;
                        continue;
                    }
                    break;
                }

                await memory.save();
                console.log(chalk.green(`\nSession "${options.session}" saved.`));
                return true;
            } catch (error: any) {
                console.error(chalk.red(`${isFallback ? 'Fallback' : 'Primary'} Error: ${error.message}`));
                return false;
            }
        }

        const success = await attemptChat(modelId);
        if (!success && config.fallback?.model && modelId !== config.fallback.model) {
            console.log(chalk.yellow(`\nPrimary model failed. Attempting fallback to ${config.fallback.model}...`));
            await attemptChat(config.fallback.model, true);
        }
    });

program
    .command('clear')
    .description('Clear session memory')
    .argument('<session>', 'Session ID to clear')
    .action(async (session) => {
        const memory = new SessionMemory(session);
        await memory.load();
        memory.clear();
        await memory.save();
        console.log(chalk.green(`Session "${session}" cleared.`));
    });

program
    .command('setup')
    .description('Reset the setup wizard status for the UI')
    .action(async () => {
        const configManager = new ConfigManager();
        const config = await configManager.load();
        config.setupComplete = false;
        await configManager.save(config);
        console.log(chalk.green('\n[Setup] Wizard status has been reset.'));
        console.log(chalk.blue('Please refresh your browser at http://localhost:5173 to re-run the configuration.'));
    });

program.parse(process.argv);
