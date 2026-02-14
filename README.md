# SimpleClaw 🦞

<div style="font-size: 2em; font-weight: bold; text-align: center;">
  Neural Modes
</div>

<div style="font-size: 1.2em; text-align: center;">
  Choose the mode that fits your needs:
</div>

<div style="display: flex; justify-content: space-around; margin-top: 20px;">
  <div>
    <div style="font-size: 1.5em; font-weight: bold;">Super-Eco (The Ghost)</div>
    <div style="font-size: 1em;">Maximum speed, minimum token usage. Best for quick questions and simple tasks.</div>
  </div>
  <div>
    <div style="font-size: 1.5em; font-weight: bold;">Standard (The Assistant)</div>
    <div style="font-size: 1em;">Balanced experience for general coding tasks and debugging.</div>
  </div>
  <div>
    <div style="font-size: 1.5em; font-weight: bold;">Full-Context (The Engineer)</div>
    <div style="font-size: 1em;">Unrestricted power for complex problem-solving. Use with caution!</div>
  </div>
</div>

<br>

# SimpleClaw 🦞

SimpleClaw is a minimalist, local-first, **Vibe Coded** AI operational assistant. It serves as a gateway to local models (via Ollama) and remote providers (OpenAi, OpenRouter, HuggingFace), providing both a Command Line Interface (CLI) and a modern Web UI.

Built with a focus on **portability** and **self-evolution**, SimpleClaw allows you to manage AI interactions with ease while keeping your data under your control. 

> *If you need something added or a new tool , just ask it to do it—it will do it.*

> [!CAUTION]
> **UNRESTRICTED EVOLUTION**: SimpleClaw is designed to be fundamentally self-evolving. The assistant has the freedom to create new tools, modify existing code, and even rewrite its own source. This is powerful but **DAREGEROUS**. Safety rails are almost non-existent by design. Use with extreme caution and have fun.

## 🚀 Key Features

- **🧩 Smart Sanitization**: Automatically strips internal "thinking" and technical XML tags from user-facing chat for a cleaner experience.
- **🚥 Request Queuing**: Serializes chat requests per session to prevent race conditions and memory corruption.
- **🛰️ Background Tasks**: Support for non-blocking command execution with asynchronous result reporting.
- **🔍 Advanced Search**: Integrated codebase search with support for file extensions and content grepping.
- **🧱 Tiered Memory Summarization**: New mode-specific summarization intensities (Super-Eco, Eco, Standard) for high token efficiency.
- **🔘 Mechanical Summarizer Switch**: Explicitly toggle between primary and dedicated models for background tasks to save tokens.
- **🛡️ Passive isolation**: Every session is archived and starts with a clean slate for maximum privacy and performance.
- **Portability First**: Absolute path-agnostic architecture—run SimpleClaw from any folder on any machine.

- **One-Click Setup**: Automated installer handles paths, dependencies, and builds for you.

> [!TIP]
> **Deep Documentation**: For technical details on the API, Core Engine, and Neural Modes, see the **[Full Documentation Suite](docs/README.md)**.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [Ollama](https://ollama.com/) (Optional, for local model support)

### Installation

SimpleClaw is designed to be installed and calibrated with a single command:

1. Clone or download this repository.
2. Open a terminal in the project root.
3. Run the setup script:
   ```batch
   setup.bat
   ```
   *This will automatically install dependencies, recalibrate paths for your machine, build the project, and launch the UI.*

## 📖 Usage

### Using the Web UI
The UI will automatically launch at `http://localhost:5173` after setup. It features:
- **Provider Management**: Redacted API key management directly in the browser.
- **Interactive Chat**: Real-time interaction with your selected models.
- **Session Control**: Archive and manage multiple conversation histories.

### Using the CLI
You can interact with SimpleClaw directly from your terminal using `simpleclaw.bat`:
```batch
simpleclaw list                      # List all discovered models
simpleclaw chat -m llama3.1 -q "Hi"  # Quick chat with a specific model
simpleclaw setup                     # Reset the UI wizard
```

## 🏗️ Architecture

SimpleClaw is built with:
- **Backend**: Node.js & Express (TypeScript)
- **Frontend**: React & Vite (Modern Aesthetics)
- **Data**: Local JSON-based storage for sessions and configuration.

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

SimpleClaw is proudly inspired by **[OpenClaw](https://github.com/openclaw/openclaw)**. We thank the OpenClaw community for their pioneering work in personal AI systems. SimpleClaw aims to provide a simplified, user-first experience built on those foundational ideas.

**Contact**: [mhndayesh@gmail.com](mailto:mhndayesh@gmail.com)

