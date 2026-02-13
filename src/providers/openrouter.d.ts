import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';
export declare class OpenRouterProvider implements Provider {
    readonly id = "openrouter";
    private apiKey;
    constructor(apiKey: string);
    discoverModels(): Promise<ModelMetadata[]>;
    chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse>;
}
//# sourceMappingURL=openrouter.d.ts.map