export interface ModelMetadata {
    id: string;
    name: string;
    provider: string;
    contextWindow?: number;
}

export interface Provider {
    readonly id: string;
    discoverModels(): Promise<ModelMetadata[]>;
    chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse>;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}
