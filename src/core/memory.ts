import * as fs from 'fs/promises';
import * as path from 'path';
import { getProjectRoot } from './paths.js';
import type { ChatMessage } from '../providers/types.js';

export class SessionMemory {
    private history: ChatMessage[] = [];
    private sessionPath: string;
    private metaPath: string;

    constructor(sessionId: string, storageDir: string = path.join(getProjectRoot(), 'storage')) {
        this.sessionPath = path.join(storageDir, `session_${sessionId}.json`);
        this.metaPath = path.join(storageDir, `session_${sessionId}.meta.json`);
    }

    async load(): Promise<ChatMessage[]> {
        try {
            const data = await fs.readFile(this.sessionPath, 'utf-8');
            this.history = JSON.parse(data);
        } catch {
            this.history = [];
        }
        return this.history;
    }

    async save(): Promise<void> {
        const dir = path.dirname(this.sessionPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.sessionPath, JSON.stringify(this.history, null, 2));
        // ensure meta directory exists (meta write happens separately)
        try {
            const metaDir = path.dirname(this.metaPath);
            await fs.mkdir(metaDir, { recursive: true });
        } catch {
            // ignore
        }
    }

    async loadMeta(): Promise<Record<string, any>> {
        try {
            const data = await fs.readFile(this.metaPath, 'utf-8');
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    async saveMeta(obj: Record<string, any>): Promise<void> {
        const dir = path.dirname(this.metaPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.metaPath, JSON.stringify(obj, null, 2));
    }

    async setMode(mode: string): Promise<void> {
        const meta = await this.loadMeta();
        meta.mode = mode;
        await this.saveMeta(meta);
    }

    async getMode(): Promise<string | undefined> {
        const meta = await this.loadMeta();
        return meta.mode;
    }

    async incrementRequestCount(): Promise<void> {
        const meta = await this.loadMeta();
        meta.usage = meta.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 };
        meta.usage.requestCount = (meta.usage.requestCount || 0) + 1;
        await this.saveMeta(meta);
    }

    async addUsage(inputTokens: number, outputTokens: number): Promise<void> {
        const meta = await this.loadMeta();
        meta.usage = meta.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 };
        meta.usage.inputTokens += inputTokens;
        meta.usage.outputTokens += outputTokens;
        meta.usage.totalTokens = meta.usage.inputTokens + meta.usage.outputTokens;
        await this.saveMeta(meta);
    }

    addMessage(message: ChatMessage) {
        this.history.push(message);
    }

    getHistory(): ChatMessage[] {
        return this.history;
    }

    clear() {
        this.history = [];
    }
}
