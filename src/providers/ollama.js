import axios from 'axios';
export class OllamaProvider {
    id = 'ollama';
    baseUrl;
    constructor(baseUrl = 'http://127.0.0.1:11434') {
        this.baseUrl = baseUrl;
    }
    async discoverModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
            const data = response.data;
            if (!data.models || !Array.isArray(data.models)) {
                return [];
            }
            return data.models.map((m) => ({
                id: m.model || m.name,
                name: m.name,
                provider: 'ollama'
            }));
        }
        catch (error) {
            // Fail silently if Ollama is not running
            return [];
        }
    }
    async chat(modelId, messages) {
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
//# sourceMappingURL=ollama.js.map