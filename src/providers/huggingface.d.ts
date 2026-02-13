import type { Provider, ModelMetadata, ChatMessage, ChatResponse } from './types.js';
export declare class HuggingFaceProvider implements Provider {
    readonly id = "huggingface";
    private apiKey;
    constructor(apiKey: string);
    discoverModels(): Promise<ModelMetadata[]>;
    chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse>;
}
//# sourceMappingURL=huggingface.d.ts.map