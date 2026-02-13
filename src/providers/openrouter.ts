import axios from 'axios';
import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';

export class OpenRouterProvider implements Provider {
    readonly id = 'openrouter';
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async discoverModels(): Promise<ModelMetadata[]> {
        if (!this.apiKey) return [];
        try {
            const response = await axios.get('https://openrouter.ai/api/v1/models', {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            });
            return response.data.data.map((m: any) => ({
                id: m.id,
                name: m.name,
                provider: 'openrouter'
            }));
        } catch {
            return [];
        }
    }

    async chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse> {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: modelId,
            messages: messages
        }, {
            headers: { Authorization: `Bearer ${this.apiKey}` }
        });

        return {
            content: response.data.choices[0].message.content,
            usage: {
                inputTokens: response.data.usage?.prompt_tokens || 0,
                outputTokens: response.data.usage?.completion_tokens || 0
            }
        };
    }
}
