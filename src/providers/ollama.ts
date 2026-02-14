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
        const now = Date.now();
        if (this.cachedModels && this.cachedModels.length > 0 && (now - this.lastDiscovery) < this.discoveryInterval) {
            return this.cachedModels;
        }

        const hosts = ['http://127.0.0.1:11434', 'http://localhost:11434', 'http://ollama:11434'];

        // Probe all potential hosts in parallel to avoid sequential timeout delays
        const probes = hosts.map(async (host) => {
            try {
                const response = await axios.get(`${host}/api/tags`, { timeout: 1000 });
                const data = response.data;
                if (data.models && Array.isArray(data.models) && data.models.length > 0) {
                    return { host, models: data.models };
                }
            } catch {
                return null;
            }
            return null;
        });

        const results = await Promise.all(probes);
        const successfulProbe = results.find(r => r !== null);

        if (successfulProbe) {
            // console.log(`[Ollama] auto-detected ${successfulProbe.models.length} model(s) on ${successfulProbe.host}`);
            this.baseUrl = successfulProbe.host;
            this.cachedModels = successfulProbe.models.map((m: any) => ({
                id: m.model || m.name,
                name: m.name,
                provider: 'ollama'
            }));
            this.lastDiscovery = Date.now();
            return this.cachedModels;
        }

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
