import fs from 'fs';
import path from 'path';
import { getProjectRoot } from './utils.js';
import { getSystemPrompt } from './core/identity.js';

export interface AppConfig {
    primary?: { provider: string; model: string };
    summarizer?: { provider: string; model: string };
    summarizerEnabled?: boolean;
    fallback?: { provider: string; model: string };
    security?: { enabled: boolean };
    activeMode?: string;
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
            console.log('[System] Config saved:', JSON.stringify(config));

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
        const mode = (this.config as any).activeMode || 'standard';
        return getSystemPrompt(mode);
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
