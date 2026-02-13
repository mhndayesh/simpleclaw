import axios from 'axios';
export class HuggingFaceProvider {
    id = 'huggingface';
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async discoverModels() {
        // HF doesn't have a simple "list my enabled models" so we'll provide some defaults
        // or allow the user to suggest ones. For now, we return a few popular ones if an API key exists.
        if (!this.apiKey)
            return [];
        return [
            { id: 'google/gemma-2-9b-it', name: 'Gemma 2 9B', provider: 'huggingface' },
            { id: 'meta-llama/Llama-3.1-8B-Instruct', name: 'Llama 3.1 8B', provider: 'huggingface' },
            { id: 'mistralai/Mistral-7B-v0.3', name: 'Mistral 7B', provider: 'huggingface' }
        ];
    }
    async chat(modelId, messages) {
        // Using the Inference API (Serverless)
        const response = await axios.post(`https://api-inference.huggingface.co/models/${modelId}/v1/chat/completions`, {
            model: modelId,
            messages: messages,
            stream: false
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
//# sourceMappingURL=huggingface.js.map