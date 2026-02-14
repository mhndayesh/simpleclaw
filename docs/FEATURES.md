# SimpleClaw Features Deep-Dive 🦞

SimpleClaw isn't just a model picker; it's a complete local AI ecosystem. Below is a comprehensive list of every feature currently baked into the project.

## 🧠 Intelligence & Models
- **Hybrid Provider Support**: native integration for Ollama, OpenRouter, and Hugging Face.
- **Model Discovery**: Real-time scanning of local and remote model libraries.
- **Neural Protocol Modes**:
    - `super-eco`: Ultra-fast, low-context logic.
    - `standard`: Balanced Turn-based assistance.
    - `full-context`: Unrestricted engineering mode.
- **Mechanical Summarizer Switch**: Dedicated model compute gate for background tasks.
- **Model Fallbacks**: Automatic "Plan B" if your primary model fails or is offline.


## 🛠️ Assistant Capabilities (The Tool Loop)
- **Active Self-Mutation**: The assistant can rewrite its own code (source files in `src/` and `ui/`).
- **Dynamic Tool Creation**: Can generate and execute new scripts in real-time.
- **System Command Execution**: Directly interacts with the shell for file management, builds, and more.
- **Markdown Response Processing**: Intelligently extracts `<EXEC>` and `<WRITE>` tags from AI responses.

## 📁 Data & Portability
- **Root Calibration Engine**: Self-correcting absolute path detection via `setup.bat`.
- **Zero-Absolute Persistence**: Session data and settings are strictly relative to the project home.
- **Local-First Storage**: No cloud databases required; all memory is stored in transparent JSON files.
- **Passive Isolation Protocol**: Every reset archives the session and wipes memory to 0, ensuring a fresh context.
- **Session Archiving**: Automatic storage of summaries and usage stats in `storage/sessions/`.


## 💻 Interfaces
- **Universal CLI**: Fully functional command-line terminal with memory and tool support.
- **Sleek Web UI**:
    - Dark-mode optimized, modern aesthetic.
    - Setup Wizard for one-click configuration.
    - Redacted API Key management for security.
    - Real-time token usage and cost metrics.
- **Neural Mode Selector**: Global switch for changing the assistant's brain profile instantly.

## 🧹 Security & Sanitization (Published State)
- **Automatic Sanitizer**: One-click script to strip all API keys and personal data.
- **Deep Cleanup**: Removes temporary numeric folders and backup artifacts.
- **Leak Prevention**: Pre-configured `.gitignore` protecting and isolating private data.

## 🚀 Speed & Efficiency
- **Mode-Aware Compaction**: Intelligent summarization of history to keep context windows short and crisp.
- **Background Server Architecture**: Backend runs minimized, allowing the UI and CLI to feel snappy.
- **TypeScript Core**: Robust, type-safe logic compiled for maximum execution speed.
