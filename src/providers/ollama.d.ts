import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';
export declare class OllamaProvider implements Provider {
    readonly id = "ollama";
    private baseUrl;
    constructor(baseUrl?: string);
    discoverModels(): Promise<ModelMetadata[]>;
    chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse>;
}
//# sourceMappingURL=ollama.d.ts.map