import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import { getProjectRoot } from './core/paths.js';
import { OllamaProvider } from './providers/ollama.js';
import { OpenRouterProvider } from './providers/openrouter.js';
import { HuggingFaceProvider } from './providers/huggingface.js';
import type { Provider, ModelMetadata } from './providers/types.js';
import { SessionMemory } from './core/memory.js';
import { getSystemPrompt } from './core/identity.js';
import { extractCommands, executeTool, extractWriteCommands, writeTool } from './core/tools.js';
import { ConfigManager } from './core/config.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const ROOT_DIR = getProjectRoot();
const STORAGE_DIR = path.join(ROOT_DIR, 'storage');
const SECRETS_DIR = path.join(ROOT_DIR, 'env');

app.use(cors());
app.use(express.json());

async function getSecret(name: string): Promise<string | undefined> {
    // Try env/ first, then process.env
    try {
        const filePath = path.join(SECRETS_DIR, `${name.toLowerCase()}.txt`);
        const content = await fs.readFile(filePath, 'utf-8');
        return content.trim();
    } catch {
        return process.env[name.toUpperCase()];
    }
}

async function getProviders(): Promise<Provider[]> {
    const providers: Provider[] = [new OllamaProvider()];

    const openRouterKey = await getSecret('openrouter');
    if (openRouterKey) {
        providers.push(new OpenRouterProvider(openRouterKey));
    }

    const hfKey = await getSecret('hf');
    if (hfKey) {
        providers.push(new HuggingFaceProvider(hfKey));
    }

    return providers;
}

// Get available models
app.get('/api/models', async (req, res) => {
    try {
        const providers = await getProviders();
        const allModels: ModelMetadata[] = [];
        for (const provider of providers) {
            const models = await provider.discoverModels();
            allModels.push(...models);
        }
        res.json(allModels);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get current config
app.get('/api/config', async (req, res) => {
    const configManager = new ConfigManager();
    const config = await configManager.load();
    res.json(config);
});

// Redact key for UI
function redact(key?: string) {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// Get secrets (redacted)
app.get('/api/secrets', async (req, res) => {
    const openrouter = await getSecret('openrouter');
    const hf = await getSecret('hf');
    res.json({
        openrouter: redact(openrouter),
        hf: redact(hf)
    });
});

// Save secrets
app.post('/api/secrets', async (req, res) => {
    const { openrouter, hf } = req.body;
    try {
        if (openrouter && !openrouter.includes('...')) {
            await fs.mkdir(SECRETS_DIR, { recursive: true });
            await fs.writeFile(path.join(SECRETS_DIR, 'openrouter.txt'), openrouter.trim());
            console.log(chalk.green('[Secrets] Updated OpenRouter API Key.'));
        }
        if (hf && !hf.includes('...')) {
            await fs.mkdir(SECRETS_DIR, { recursive: true });
            await fs.writeFile(path.join(SECRETS_DIR, 'hf.txt'), hf.trim());
            console.log(chalk.green('[Secrets] Updated Hugging Face API Key.'));
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update config
app.post('/api/config', async (req, res) => {
    try {
        const configManager = new ConfigManager();
        await configManager.save(req.body);
        console.log(chalk.green('[Config] Configuration updated:'), JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error: any) {
        console.error(chalk.red('[Config] Error saving config:'), error.message);
        res.status(500).json({ error: error.message });
    }
});

// Check setup status
app.get('/api/setup-status', async (req, res) => {
    try {
        const configManager = new ConfigManager();
        const config = await configManager.load();

        const openrouter = await getSecret('openrouter');
        const hf = await getSecret('hf');

        const ollamaProvider = new OllamaProvider();
        const ollamaModels = await ollamaProvider.discoverModels();
        const hasOllama = ollamaModels.length > 0;

        if (hasOllama) {
            console.log(chalk.green(`[Setup] Auto-detected ${ollamaModels.length} Ollama models.`));
        } else {
            console.log(chalk.yellow(`[Setup] No local Ollama models detected.`));
        }

        // Use setupComplete flag for explicit check, fallback to heuristic
        const isConfigured = !!config.setupComplete;

        res.json({
            isSetup: isConfigured,
            hasPrimary: !!config.primary?.model,
            hasKeys: !!(openrouter || hf),
            hasOllama
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get session history and mode
app.get('/api/session', async (req, res) => {
    const session = (req.query.session as string) || 'default';
    try {
        const memory = new SessionMemory(session as string, STORAGE_DIR);
        await memory.load();
        const meta = await memory.loadMeta();
        const usage = meta.usage || { totalTokens: 0, requestCount: 0 };
        const avgTokens = usage.requestCount > 0 ? Math.round(usage.totalTokens / usage.requestCount) : 0;
        res.json({ history: memory.getHistory(), mode: meta.mode || 'super-eco', usage: { ...usage, avgTokens } });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Archive current session and start a new empty session
app.post('/api/session/new', async (req, res) => {
    const session = (req.body?.session as string) || 'default';
    try {
        const memory = new SessionMemory(session, STORAGE_DIR);
        await memory.load();

        if (memory.getHistory().length > 0) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archivePath = path.join(STORAGE_DIR, `session_${session}_${timestamp}.json`);
            const metaArchivePath = path.join(STORAGE_DIR, `session_${session}.meta_${timestamp}.json`);
            await fs.copyFile(path.join(STORAGE_DIR, `session_${session}.json`), archivePath);
            try { await fs.copyFile(path.join(STORAGE_DIR, `session_${session}.meta.json`), metaArchivePath); } catch { }
        }

        memory.clear();
        // Compact memory according to session mode before saving
        try {
            const currentMode = (await memory.getMode()) || 'super-eco';
            await compactMemoryForMode(memory, currentMode);
        } catch (e) {
            // ignore compaction errors
        }
        await memory.save();
        await memory.saveMeta({});

        const meta = await memory.loadMeta();
        res.json({ success: true, history: memory.getHistory(), mode: meta.mode || 'super-eco', usage: meta.usage });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Chat endpoint with tool loop
app.post('/api/chat', async (req, res) => {
    const { query, model, session = 'default' } = req.body;
    const configManager = new ConfigManager();
    const config = await configManager.load();
    const providers = await getProviders();

    let modelId = model || config.primary?.model;
    if (!modelId) {
        return res.status(400).json({ error: 'No model specified and no default primary model set.' });
    }

    const memory = new SessionMemory(session, STORAGE_DIR);
    await memory.load();
    const metaOnEntry = await memory.loadMeta();
    const initialMode = metaOnEntry.mode || 'super-eco';
    console.log(chalk.cyan(`[Chat] Entry: Session=${session}, Mode=${initialMode}`));

    await memory.incrementRequestCount();

    // If empty, seed system prompt with the current mode
    if (memory.getHistory().length === 0) {
        memory.addMessage({ role: 'system', content: getSystemPrompt(initialMode) });
    }

    // Handle mode changes (from SYSTEM command or natural language)
    if (typeof query === 'string') {
        const qUpper = query.trim().toUpperCase();
        let targetMode = '';

        if (qUpper.startsWith('SYSTEM: CHANGE MODE TO')) {
            targetMode = qUpper.replace('SYSTEM: CHANGE MODE TO', '').trim().toLowerCase();
        } else if (qUpper.startsWith('SWITCH TO ') && qUpper.endsWith(' MODE')) {
            targetMode = qUpper.replace('SWITCH TO ', '').replace(' MODE', '').trim().toLowerCase();
        }

        if (targetMode === 'full') targetMode = 'full-context';

        if (targetMode && ['super-eco', 'standard', 'full-context'].includes(targetMode)) {
            console.log(chalk.magenta(`[Chat] CRITICAL: Hard-switching to mode: ${targetMode}`));
            await memory.setMode(targetMode);

            // CRITICAL: Synchronize the initial system prompt in history if it exists
            const history = memory.getHistory();
            if (history && history.length > 0 && history[0] && history[0].role === 'system') {
                history[0].content = getSystemPrompt(targetMode);
                console.log(chalk.magenta(`[Chat] System prompt synchronized for ${targetMode}`));
            }

            // FORCEFUL OVERRIDE: Clear any LLM confusion
            memory.addMessage({
                role: 'system',
                content: `[URGENT OPERATIONAL ALERT] NEURAL MODE LOCKED: ${targetMode.toUpperCase()}. 
PERSONA RESET COMPLETED. You are now a ${targetMode.toUpperCase()} unit.`
            });

            await memory.save();
            const updatedMeta = await memory.loadMeta();
            return res.json({
                history: memory.getHistory(),
                newEvents: [{ role: 'system', content: `Neural protocols updated: ${targetMode.toUpperCase()} active.` }],
                mode: updatedMeta.mode || 'super-eco',
                usage: updatedMeta.usage
            });
        }

        // Catch-all for other SYSTEM commands
        if (qUpper.startsWith('SYSTEM:')) {
            memory.addMessage({ role: 'system', content: `Received command: ${query}` });
            await memory.save();
            return res.json({ history: memory.getHistory(), newEvents: [{ role: 'system', content: `Command handled.` }] });
        }
    }

    memory.addMessage({ role: 'user', content: query });

    let foundPair: { provider: Provider, model: { id: string, provider: string } } | null = null;

    async function findProvider(id: string) {
        for (const p of providers) {
            const models = await p.discoverModels();
            const found = models.find(m => m.id === id);
            if (found) return { provider: p, model: found };
        }
        // Fallback or Manual override?
        // If it looks like a manual OpenRouter ID (e.g. contains '/'), try forcing it with the OpenRouter provider
        if (id.includes('/')) {
            const orp = providers.find(p => p instanceof OpenRouterProvider);
            if (orp) return { provider: orp, model: { id, provider: 'openrouter' } };
        }
        return null;
    }

    foundPair = await findProvider(modelId);

    // Fallback logic
    if (!foundPair && config.fallback?.model && modelId !== config.fallback.model) {
        console.log(chalk.yellow(`Primary model ${modelId} not found, trying fallback ${config.fallback.model}`));
        foundPair = await findProvider(config.fallback.model);
    }

    if (!foundPair) {
        return res.status(404).json({ error: 'Model not found (including fallback). Check your API keys.' });
    }

    const selectedProvider = foundPair.provider;
    const selectedModelId = foundPair.model.id;

    try {
        const meta = await memory.loadMeta();
        const currentMode = meta.mode || 'super-eco';
        console.log(chalk.blue(`[Chat] Processing with Mode: ${currentMode}`));

        let turn = 0;
        let maxTurns = 5;
        if (currentMode === 'super-eco') maxTurns = 1;
        if (currentMode === 'standard') maxTurns = 5;
        if (currentMode === 'full-context') maxTurns = 10;

        console.log(chalk.blue(`[Chat] Mode: ${currentMode}, maxTurns: ${maxTurns}`));

        const events: any[] = [];

        while (turn < maxTurns) {
            const response = await selectedProvider.chat(selectedModelId, memory.getHistory());
            if (response.usage) {
                await memory.addUsage(response.usage.inputTokens, response.usage.outputTokens);
            }
            memory.addMessage({ role: 'assistant', content: response.content });
            events.push({ role: 'assistant', content: response.content });

            const writeCommands = extractWriteCommands(response.content);
            if (writeCommands.length > 0) {
                for (const cmd of writeCommands) {
                    const result = await writeTool(cmd.path, cmd.content);
                    memory.addMessage({ role: 'user', content: `Write result for "${cmd.path}": ${result}` });
                    events.push({ role: 'system', content: `[Write] ${cmd.path}: ${result}` });
                }
                turn++;
                continue;
            }

            const commands = extractCommands(response.content);
            if (commands.length > 0) {
                for (const cmd of commands) {
                    const result = await executeTool(cmd);
                    memory.addMessage({ role: 'user', content: `Tool result for "${cmd}":\n${result}` });
                    events.push({ role: 'system', content: `[Exec] ${cmd}: ${result}` });
                }
                turn++;
                continue;
            }
            break;
        }

        await memory.save();
        const finalMeta = await memory.loadMeta();
        const usage = finalMeta.usage || { totalTokens: 0, requestCount: 0 };
        const avgTokens = usage.requestCount > 0 ? Math.round(usage.totalTokens / usage.requestCount) : 0;
        res.json({
            history: memory.getHistory(),
            newEvents: events,
            mode: finalMeta.mode || 'super-eco',
            usage: { ...usage, avgTokens }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Compact memory for super-eco mode: summarize every 3 user requests and keep last 3 raw
function truncateText(s: string, wordLimit = 12) {
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length <= wordLimit) return s;
    return words.slice(0, wordLimit).join(' ') + '...';
}
// Mode-aware compaction: apply different compaction strategies per mode.
async function compactMemoryForMode(memory: any, mode: string) {
    try {
        if (!mode || mode === 'full-context') return; // full mode: no compaction

        const hist = memory.getHistory();
        if (!hist || hist.length <= 1) return;

        // preserve leading system messages
        const leading: any[] = [];
        let idx = 0;
        while (idx < hist.length && hist[idx].role === 'system') {
            leading.push(hist[idx]);
            idx++;
        }

        const rest = hist.slice(idx);
        const totalUser = rest.filter((m: any) => m.role === 'user').length;

        // configure thresholds per mode
        let keepLastUsers = 3; // default for super-eco
        let groupThreshold = 3;
        let wordLimit = 10;

        if (mode === 'standard') {
            keepLastUsers = 10; // keep more raw user turns
            groupThreshold = 5; // summarize groups of 5 earlier user turns
            wordLimit = 18; // allow slightly longer summaries
        } else if (mode === 'super-eco') {
            keepLastUsers = 3;
            groupThreshold = 3;
            wordLimit = 10;
        }

        const cutoffUser = Math.max(0, totalUser - keepLastUsers);

        const newRest: any[] = [];
        let processedUser = 0;
        let group: any[] = [];
        let groupUserCount = 0;

        for (let i = 0; i < rest.length; i++) {
            const m = rest[i];
            if (processedUser < cutoffUser) {
                group.push(m);
                if (m.role === 'user') {
                    processedUser++;
                    groupUserCount++;
                }
                // summarize when group reaches threshold or we've hit cutoff
                if (groupUserCount >= groupThreshold || processedUser >= cutoffUser) {
                    const parts = group.map(g => `(${g.role}) ${truncateText(g.content, wordLimit)}`);
                    const summary = `[${mode} Summary] ${parts.join(' | ')}`;
                    newRest.push({ role: 'system', content: summary });
                    group = [];
                    groupUserCount = 0;
                }
            } else {
                // after cutoff; keep as-is
                newRest.push(m);
            }
        }

        if (group.length > 0) {
            const parts = group.map(g => `(${g.role}) ${truncateText(g.content, wordLimit)}`);
            const summary = `[${mode} Summary] ${parts.join(' | ')}`;
            newRest.push({ role: 'system', content: summary });
        }

        // rebuild memory
        memory.clear();
        for (const m of [...leading, ...newRest]) memory.addMessage(m);

        // log for debugging
        console.log(chalk.magenta(`Compacted memory for mode=${mode}: totalUser=${totalUser}, keptLastUsers=${keepLastUsers}`));
    } catch (e: any) {
        console.log(chalk.red('Compaction error:'), e?.message || e);
    }
}

app.listen(port, () => {
    console.log(chalk.green(`\nSimpleClaw API Server running at http://localhost:${port}`));
    console.log(chalk.blue(`Listening for keys in ./env/*.txt`));
});
