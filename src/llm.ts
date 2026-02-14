import { System } from './system.js';

export interface Usage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    avgTokens?: number;
}

export class LLM {
    private system: System;

    constructor() {
        this.system = System.getInstance();
    }

    public async chat(messages: { role: string, content: string }[]): Promise<{ content: string, usage: Usage }> {
        const primary = this.system.config.primary;
        const provider = primary?.provider || 'ollama';
        const model = primary?.model || 'llama3';
        const secrets = this.system.getSecrets();

        let url = 'http://localhost:11434/api/chat';
        let headers: Record<string, string> = { 'Content-Type': 'application/json' };
        let body: any = { model, messages, stream: false };
        const usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

        try {
            if (provider === 'openrouter') {
                url = 'https://openrouter.ai/api/v1/chat/completions';
                headers['Authorization'] = `Bearer ${secrets.openrouter}`;
                headers['HTTP-Referer'] = 'https://github.com/mhndayesh/simpleclaw';
            } else if (provider === 'openai') {
                url = 'https://api.openai.com/v1/chat/completions';
                headers['Authorization'] = `Bearer ${secrets.openai}`;
            } else if (provider === 'huggingface') {
                url = `https://api-inference.huggingface.co/models/${model}`;
                headers['Authorization'] = `Bearer ${secrets.hf}`;
                const lastMsg = messages[messages.length - 1];
                body = { inputs: lastMsg ? lastMsg.content : '' };
            }

            console.log(`[LLM] Requesting ${provider}:${model} at ${url}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`${provider} API Error: ${response.status} ${errText}`);
            }

            const data = await response.json() as any;

            // Extract Usage
            if (provider === 'ollama') {
                usage.inputTokens = data.prompt_eval_count || 0;
                usage.outputTokens = data.eval_count || 0;
                usage.totalTokens = usage.inputTokens + usage.outputTokens;
                return { content: data.message?.content || '', usage };
            } else if (provider === 'huggingface') {
                return { content: data[0]?.generated_text || data.summary_text || JSON.stringify(data), usage };
            } else {
                // OpenAI / OpenRouter standard
                const u = data.usage;
                if (u) {
                    usage.inputTokens = u.prompt_tokens || 0;
                    usage.outputTokens = u.completion_tokens || 0;
                    usage.totalTokens = u.total_tokens || 0;
                }
                return { content: data.choices?.[0]?.message?.content || '', usage };
            }

        } catch (error: any) {
            console.error('[LLM] Error:', error.message);
            return {
                content: `[System Error] ${provider} Unreachable or Error: ${error.message}`,
                usage
            };
        }
    }
}
