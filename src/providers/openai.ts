import axios from 'axios';
import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';

export class OpenAIProvider implements Provider {
    readonly id = 'openai';
    private apiKey: string = "";

    constructor(apiKey: string = "") {
        this.apiKey = apiKey;
    }

    async discoverModels(): Promise<ModelMetadata[]> {
        if (!this.apiKey) return [];
        try {
            const resp = await axios.get('https://api.openai.com/v1/models', {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            });
            if (!resp.data || !Array.isArray(resp.data.data)) return [];
            return resp.data.data.map((m: any) => ({ id: m.id, name: m.id, provider: 'openai' }));
        } catch (e) {
            return [];
        }
    }

    async chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse> {
        const payload = {
            model: modelId,
            messages: messages.map(m => ({ role: m.role, content: m.content }))
        };

        const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
            headers: { Authorization: `Bearer ${this.apiKey}` }
        });

        const choice = resp.data.choices && resp.data.choices[0];
        return {
            content: choice?.message?.content || choice?.text || '',
            usage: {
                inputTokens: resp.data.usage?.prompt_tokens || 0,
                outputTokens: resp.data.usage?.completion_tokens || 0
            }
        };
    }
}
