import axios from 'axios';
import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';

export class OllamaProvider implements Provider {
    readonly id = 'ollama';
    private baseUrl: string;
    private cachedModels: ModelMetadata[] = [];
    private lastDiscovery = 0;
    private discoveryInterval = 30 * 1000; // 30s

    constructor(baseUrl: string = 'http://127.0.0.1:11434') {
        this.baseUrl = baseUrl;
    }

    async discoverModels(): Promise<ModelMetadata[]> {
        // Return cached result if discovery was recent
        const now = Date.now();
        if (this.cachedModels && this.cachedModels.length > 0 && (now - this.lastDiscovery) < this.discoveryInterval) {
            return this.cachedModels;
        }

        const hosts = ['http://127.0.0.1:11434', 'http://localhost:11434', 'http://ollama:11434'];

        for (const host of hosts) {
            try {
                // Minimal log to avoid spamming during startup
                console.log(`[Ollama] probing ${host}...`);
                const response = await axios.get(`${host}/api/tags`, { timeout: 800 });
                const data = response.data;

                if (data.models && Array.isArray(data.models) && data.models.length > 0) {
                    console.log(`[Ollama] found ${data.models.length} models on ${host}`);
                    this.baseUrl = host;
                    this.cachedModels = data.models.map((m: any) => ({
                        id: m.model || m.name,
                        name: m.name,
                        provider: 'ollama'
                    }));
                    this.lastDiscovery = Date.now();
                    return this.cachedModels;
                }
            } catch (error) {
                // Try next host; keep errors quiet to avoid noisy logs
                continue;
            }
        }

        // No models found; update cache timestamp to avoid immediate retries
        this.cachedModels = [];
        this.lastDiscovery = Date.now();
        return [];
    }

    async chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse> {
        const response = await axios.post(`${this.baseUrl}/api/chat`, {
            model: modelId,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            stream: false
        });

        return {
            content: response.data.message.content,
            usage: {
                inputTokens: response.data.prompt_eval_count || 0,
                outputTokens: response.data.eval_count || 0
            }
        };
    }
}
