import axios from 'axios';
export class OpenRouterProvider {
    id = 'openrouter';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async discoverModels() {
        if (!this.apiKey)
            return [];
        try {
            const response = await axios.get('https://openrouter.ai/api/v1/models', {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            });
            return response.data.data.map((m) => ({
                id: m.id,
                name: m.name,
                provider: 'openrouter'
            }));
        }
        catch {
            return [];
        }
    }
    async chat(modelId, messages) {
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
//# sourceMappingURL=openrouter.js.map