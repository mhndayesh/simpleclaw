# AI Providers & Model Discovery

SimpleClaw supports multiple AI backends through a unified `Provider` interface.

## Supported Providers

### 1. Ollama (Local)
- **Detection**: Automatically detects models installed in your local Ollama instance (default port 11434).
- **Setup**: No keys required. Just ensure Ollama is running.
- **Behavior**: Uses the standard Ollama chat API.

### 2. OpenRouter (Remote)
- **Setup**: Requires an API key stored in `env/openrouter.txt` or the `OPENROUTER` environment variable.
- **Discovery**: Fetches the list of all available models from the OpenRouter API.
- **Fallback**: Can be used as a manual model override if a model ID contains a forward slash (`/`).

### 3. Hugging Face (Remote)
- **Setup**: Requires an API key stored in `env/hf.txt` or the `HF` environment variable.
- **Discovery**: Currently configured to fetch specific compatible models or from the user's HF profile.

## The Provider Interface
Developers can add new providers by implementing the `Provider` interface found in `src/providers/types.ts`:

```typescript
export interface Provider {
    readonly id: string;
    discoverModels(): Promise<ModelMetadata[]>;
    chat(modelId: string, messages: ChatMessage[]): Promise<ChatResponse>;
}
```

## Fallback System
If a primary model is unreachable or not found, SimpleClaw will automatically attempt to use the `fallback` model defined in your [config.json](file:///c:/simpleclaw/config.json).
