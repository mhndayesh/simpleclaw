# SimpleClaw 🦞

SimpleClaw is a minimalist, local-first, **Vibe Coded** AI operational assistant. It serves as a gateway to local models (via Ollama) and remote providers (OpenRouter, HuggingFace), providing both a Command Line Interface (CLI) and a modern Web UI.

Built with a focus on **portability** and **self-evolution**, SimpleClaw allows you to manage AI interactions with ease while keeping your data under your control. 

> *If you need something added or a new tool , just ask it to do it—it will do it.*

> [!CAUTION]
> **UNRESTRICTED EVOLUTION**: SimpleClaw is designed to be fundamentally self-evolving. The assistant has the freedom to create new tools, modify existing code, and even rewrite its own source. This is powerful but **DAREGEROUS**. Safety rails are almost non-existent by design. Use with extreme caution and have fun.

## 🚀 Key Features

- **Self-Evolution**: Ask the assistant to add new capabilities, create tools, or modify the core engine using integrated `<WRITE>` and `<EXEC>` tags.
- **Multi-Provider Support**: Seamlessly switch between Ollama, OpenRouter, and Hugging Face.
- **Dual Interface**: Full-featured CLI for terminal lovers and a sleek React-based Web UI.
- **Smart Memory Profiles**: Choose between `super-eco` (low tokens), `standard`, and `full-context` modes.
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

