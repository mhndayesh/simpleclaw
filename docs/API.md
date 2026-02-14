# SimpleClaw API Reference (v1.2.0) 📡

The SimpleClaw API is a lightweight Express server (Port 3001) that facilitates communication between the UI/CLI and the Core Engine.

## 🧩 Shared Interfaces

```typescript
interface AppConfig {
    primary: ModelRef;          // Main model
    summarizer?: ModelRef;      // Dedicated summarizer (optional)
    summarizerEnabled: boolean; // Mechanical Switch state
    fallback: ModelRef;         // FAILSAFE model
    activeMode: string;         // super-eco, eco, standard, full-context
    security: { enabled: boolean };
}

interface Usage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    avgTokens: number; // Tokens per autonomous step
}
```

## 🛤️ Endpoints Guide

### 1. Chat Engine
- **POST `/api/chat`**
  - **Payload**: `{ "message": "string" }`
  - **Behavior**: Triggers the `Agent.chat()` loop. 
  - **Response**: 
    ```json
    {
      "response": "Final distilled answer...",
      "usage": { "inputTokens": 100, "outputTokens": 50, ... },
      "mode": "standard",
      "security": "ON"
    } 
    ```
  - **Sanitization**: Before returning, the API strips all XML tags (`<EXEC>`, `<WRITE>`, etc.) and internal "thinking" blocks to provide a professional user experience.

### 2. Configuration & State
- **GET `/api/config`**: Fetches the current `config.json`.
- **POST `/api/config`**: overwrites the configuration. Used by the UI's "Save Neural Configuration" button.
- **GET `/api/setup-status`**: Returns `{ "isSetup": boolean }`.

### 3. API Key Management
- **GET `/api/secrets`**: Returns redated secrets (e.g., `sk-••••1234`).
- **POST `/api/secrets`**: Updates provider keys in the `env/` directory.

### 4. Session & History
- **GET `/api/session`**: returns current usage and mode.
- **POST `/api/session/new`**: Archives the current summary and usage to `storage/sessions/` and resets the Agent context to zero.

### 5. Model Discovery
- **GET `/api/models/:provider`**
  - **Providers**: `ollama`, `openrouter`, `openai`, `huggingface`.
  - **Behavior**: Probes the provider API. If offline (e.g., local Ollama), it returns an empty list silently to prevent UI errors.

---

## 🔘 The Mechanical Switch
The API respects the `summarizerEnabled` flag. If `true`, all summarization requests triggered during the chat loop are routed to the `summarizer` model configuration instead of the `primary` model. This allows for dedicated, low-cost compute for background tasks.
