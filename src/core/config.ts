import * as fs from 'fs/promises';
import * as path from 'path';
import { getProjectRoot } from './paths.js';

export interface ModelPreference {
    provider: string;
    model: string;
}

export interface AppConfig {
    primary?: ModelPreference;
    fallback?: ModelPreference;
    setupComplete?: boolean;
}

export class ConfigManager {
    private configPath: string;
    private config: AppConfig = {};

    constructor(baseDir: string = getProjectRoot()) {
        this.configPath = path.join(baseDir, 'config.json');
    }

    async load(): Promise<AppConfig> {
        try {
            const data = await fs.readFile(this.configPath, 'utf-8');
            this.config = JSON.parse(data);
        } catch {
            this.config = {};
        }
        return this.config;
    }

    async save(config: AppConfig): Promise<void> {
        this.config = config;
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    }

    getPrimary(): ModelPreference | undefined {
        return this.config.primary;
    }

    getFallback(): ModelPreference | undefined {
        return this.config.fallback;
    }
}
