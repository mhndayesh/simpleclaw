import fs from 'fs';
import path from 'path';
import { getProjectRoot } from './utils.js';

export interface AppConfig {
    primary?: { provider: string; model: string };
    fallback?: { provider: string; model: string };
    security?: { enabled: boolean };
}

export class System {
    private static instance: System;
    public config: AppConfig = {};
    private securityEnabled: boolean = true;
    private secrets: Record<string, string> = {};

    private constructor() {
        this.loadConfig();
    }

    public static getInstance(): System {
        if (!System.instance) {
            System.instance = new System();
        }
        return System.instance;
    }

    private loadConfig() {
        try {
            const configPath = path.join(getProjectRoot(), 'config.json');
            if (fs.existsSync(configPath)) {
                this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                // Respect security toggle
                if (this.config.security?.enabled === false) {
                    this.securityEnabled = false;
                }
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }

        this.cleanupTempTools();
        this.loadSecrets();
    }

    public saveConfig(config: AppConfig) {
        this.config = config;
        try {
            const configPath = path.join(getProjectRoot(), 'config.json');
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('[System] Config saved.');
        } catch (error) {
            console.error('[System] Failed to save config:', error);
        }
    }

    private loadSecrets() {
        const envDir = path.join(getProjectRoot(), 'env');
        if (!fs.existsSync(envDir)) fs.mkdirSync(envDir);

        const files = ['openrouter.txt', 'hf.txt', 'openai.txt', 'ollama.txt'];
        files.forEach(file => {
            const parts = file.split('.');
            const key = parts[0];
            if (!key) return;
            const p = path.join(envDir, file);
            if (fs.existsSync(p)) {
                this.secrets[key] = fs.readFileSync(p, 'utf-8').trim();
            }
        });
    }

    public getSecrets() {
        return {
            openrouter: this.secrets.openrouter || '',
            hf: this.secrets.hf || '',
            openai: this.secrets.openai || '',
            ollama: this.secrets.ollama || ''
        };
    }

    public saveSecrets(newSecrets: Record<string, string>) {
        const envDir = path.join(getProjectRoot(), 'env');
        if (!fs.existsSync(envDir)) fs.mkdirSync(envDir);

        Object.entries(newSecrets).forEach(([key, value]) => {
            if (value) {
                this.secrets[key] = value;
                fs.writeFileSync(path.join(envDir, `${key}.txt`), value);
            }
        });
        console.log('[System] Secrets updated.');
    }

    public getSetupStatus() {
        const configPath = path.join(getProjectRoot(), 'config.json');
        return fs.existsSync(configPath);
    }

    private cleanupTempTools() {
        try {
            const tempDir = path.join(getProjectRoot(), 'tools', 'temp');
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                console.log('[System] Cleared tools/temp/');
            }
            fs.mkdirSync(tempDir, { recursive: true });
        } catch (e) {
            console.error('[System] Failed to clean temp tools:', e);
        }
    }

    public isSecurityEnabled(): boolean {
        return this.securityEnabled;
    }

    public getIdentity(): string {
        const securityStatus = this.securityEnabled ? 'ACTIVE' : 'DISABLED (GOD MODE)';
        const mode = (this.config as any).activeMode || 'standard';

        return [
            `You are SimpleClaw, a capable AI assistant.`,
            `[SECURITY PROTOCOL: ${securityStatus}]`,
            `[CURRENT MODE: ${mode.toUpperCase()}]`,
            '',
            '### CORE RULES',
            '1. **Role**: You have FULL SYSTEM ACCESS to the User\'s machine.',
            '2. **Tools**: ',
            '    - <EXEC>cmd</EXEC> for terminal commands.',
            '    - <WRITE path="tools/name.js">code</WRITE> for creating files. USE THIS for new tools.',
            '    - <EXEC>node tools/switch-mode.js eco|standard|full</EXEC> to change your mode.',
            '3. **Tool Strategy**:',
            '    - **REUSE**: Check `tools/` first.',
            '    - **GENERALIZE**: If creating a NEW tool, make it GENERAL (e.g. `send-email.js`). Save to `tools/`.',
            '    - **ONE-OFF**: If a tool is truly disposable, save to `tools/temp/`.',
            '4. **Dependencies**: Install what you need.',
            '5. **Self-Correction**: Fix broken tools immediately.',
            '',
            '### PROJECT STRUCTURE',
            '- src/: Core logic.',
            '- tools/: PERMANENT General Tools.',
            '- tools/temp/: TEMPORARY Disposable Tools (Auto-wiped).',
            '- saved_data/: Output folder for artifacts.',
            '- docs/ARCHITECTURE.md: Primary Reference.',
            '',
            '### RESPONSE FORMAT',
            '- Reason before acting.',
            '- Use XML tags precisely: <EXEC>cmd</EXEC>.'
        ].join('\n');
    }
    public async getModelsForProvider(provider: string): Promise<{ id: string; provider: string }[]> {
        const p = provider.toLowerCase();
        try {
            let modelIds: string[] = [];
            if (p === 'ollama') {
                const { data } = await import('axios').then(a => a.default.get('http://localhost:11434/api/tags'));
                modelIds = data.models?.map((m: any) => m.name) || [];
            } else if (p === 'openrouter') {
                const { data } = await import('axios').then(a => a.default.get('https://openrouter.ai/api/v1/models'));
                modelIds = data.data?.map((m: any) => m.id) || [];
            } else if (p === 'openai') {
                modelIds = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
            } else if (p === 'huggingface') {
                const { data } = await import('axios').then(a => a.default.get('https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20'));
                modelIds = data.map((m: any) => m.id) || [];
            }
            return modelIds.map(id => ({ id, provider: p }));
        } catch (error: any) {
            // Only log errors as errors if it's NOT a common "offline" issue for localhost providers
            if (p === 'ollama' && error.code === 'ECONNREFUSED') {
                console.log(`[System] Ollama offline (Skipping model discovery)`);
            } else {
                console.error(`[System] Failed to fetch models for ${provider}:`, error.message);
            }
        }
        return [];
    }
}
