import express from 'express';
import { Agent } from './agent.js';
import { System } from './system.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const system = System.getInstance();
const agent = new Agent();

// Serve UI static files
const uiPath = path.join(__dirname, '../ui/dist');
app.use(express.static(uiPath));

// Fallback to index.html for SPA
app.get('/', (req, res) => {
    res.sendFile(path.join(uiPath, 'index.html'));
});

// Simplified Logic Flow
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[USER] ${message}`);
        const { response, usage } = await agent.chat(message);
        console.log(`[AGENT] ${response}`);

        res.json({
            response,
            usage,
            mode: (system.config as any).activeMode || 'standard',
            security: system.isSecurityEnabled() ? 'ON' : 'OFF'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/models', async (req, res) => {
    try {
        const providers = ['ollama', 'openrouter', 'openai', 'huggingface'];
        const results = await Promise.all(providers.map(p => system.getModelsForProvider(p)));
        const allModels = results.flat();
        res.json(allModels);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/models/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        const models = await system.getModelsForProvider(provider);
        res.json({ models });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/config', (req, res) => {
    res.json(system.config);
});

app.post('/api/config', (req, res) => {
    system.saveConfig(req.body);
    res.json({ success: true });
});

app.get('/api/secrets', (req, res) => {
    res.json(system.getSecrets());
});

app.post('/api/secrets', (req, res) => {
    system.saveSecrets(req.body);
    res.json({ success: true });
});

app.get('/api/setup-status', (req, res) => {
    res.json({ isSetup: system.getSetupStatus() });
});

app.get('/api/session', (req, res) => {
    // Basic mock session for now to satisfy UI
    res.json({
        history: [],
        mode: 'standard',
        usage: agent.sessionUsage
    });
});

app.post('/api/session/new', (req, res) => {
    agent.resetUsage();
    res.json({ success: true, mode: 'standard' });
});

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
    console.log(`SimpleClaw (Refactored) running on port ${PORT}`);
    console.log(`Security Protocol: ${system.isSecurityEnabled() ? 'ACTIVE' : 'DISABLED'}`);
});
