import { Command } from 'commander';
import chalk from 'chalk';
import * as dotenv from 'dotenv-safe';
import { OllamaProvider } from './providers/ollama.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { HuggingFaceProvider } from './providers/huggingface.js';
dotenv.config({ allowEmptyValues: true });
const program = new Command();
program
    .name('simpleclaw')
    .description('A minimalist AI gateway for local and remote models')
    .version('1.0.0');
async function getProviders() {
    const providers = [new OllamaProvider()];
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
    const allModels = [];
    for (const provider of providers) {
        try {
            const models = await provider.discoverModels();
            allModels.push(...models);
        }
        catch (err) {
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
    .command('chat')
    .description('Send a message to a model')
    .option('-m, --model <id>', 'Model ID to use')
    .requiredOption('-q, --query <text>', 'The message to send')
    .action(async (options) => {
    const providers = await getProviders();
    let selectedModel;
    let selectedProvider;
    // Discover models to find the right provider
    for (const provider of providers) {
        const models = await provider.discoverModels();
        const found = models.find(m => m.id === options.model);
        if (found) {
            selectedModel = found;
            selectedProvider = provider;
            break;
        }
    }
    if (!selectedProvider || !selectedModel) {
        console.log(chalk.red(`Model "${options.model}" not found.`));
        return;
    }
    console.log(chalk.blue(`Sending message to ${selectedModel.id} via ${selectedModel.provider}...`));
    try {
        const response = await selectedProvider.chat(selectedModel.id, [
            { role: 'user', content: options.query }
        ]);
        console.log(chalk.white('\n--- Response ---'));
        console.log(response.content);
        console.log(chalk.gray(`\nTokens: ${response.usage?.inputTokens} in / ${response.usage?.outputTokens} out`));
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
    }
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map