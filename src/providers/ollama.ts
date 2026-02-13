import axios from 'axios';
import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';

export class OllamaProvider implements Provider {
    readonly id = 'ollama';
    private baseUrl: string;

    constructor(baseUrl: string = 'http://127.0.0.1:11434') {
        this.baseUrl = baseUrl;
    }

    async discoverModels(): Promise<ModelMetadata[]> {
        const hosts = ['http://127.0.0.1:11434', 'http://localhost:11434', 'http://ollama:11434'];

        for (const host of hosts) {
            try {
                console.log(`[Ollama] Attempting discovery on ${host}...`);
                const response = await axios.get(`${host}/api/tags`, { timeout: 2000 });
                const data = response.data;

                if (data.models && Array.isArray(data.models)) {
                    console.log(`[Ollama] SUCCESS: Found ${data.models.length} models on ${host}`);
                    this.baseUrl = host;
                    return data.models.map((m: any) => ({
                        id: m.model || m.name,
                        name: m.name,
                        provider: 'ollama'
                    }));
                }
            } catch (error) {
                // Try next host
                continue;
            }
        }
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
