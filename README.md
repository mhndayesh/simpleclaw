# SimpleClaw 🦞

<div align="center">
  <img src="https://img.shields.io/badge/Version-1.2.0-blue?style=for-the-badge&logo=github" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/Status-Production--Ready-orange?style=for-the-badge" alt="Production Ready">
</div>

<br />

SimpleClaw is a minimalist, local-first, **Vibe Coded** AI operational assistant. It serves as a unified gateway to local models (via **Ollama**) and remote providers (**OpenAI, OpenRouter, HuggingFace**), providing both a Command Line Interface (CLI) and a modern Web UI.

Built with a focus on **portability** and **self-evolution**, SimpleClaw allows you to manage AI interactions with ease while keeping your data under your control.

> [!CAUTION]
> **UNRESTRICTED EVOLUTION**: SimpleClaw is designed to be fundamentally self-evolving. The assistant has the freedom to create new tools, modify existing code, and even rewrite its own source. Safety rails are almost non-existent by design. Use with extreme caution.

---

## 🧠 Neural Modes
Choose the profile that fits your specific operational needs:

| Mode | Alias | Focus | Intensity |
| :--- | :--- | :--- | :--- |
| **Super-Eco** | `ghost` | Speed & Cost | Extreme Compression |
| **Standard** | `assistant` | Productivity | Balanced Context |
| **Full-Context** | `engineer` | R&D | Unrestricted Memory |

---

## 🚀 Key Features (v1.2.0)

- **🔘 Mechanical Summarizer Switch**: Explicitly toggle between primary and dedicated models for background tasks to optimize compute.
- **🧱 Tiered Memory Summarization**: Mode-specific summarization triggers every 5 turns for maximum token efficiency.
- **🛡️ Passive Isolation**: Every session starts with a clean slate; archives are kept in `storage/sessions/` for opt-in retrieval only.
- **🚥 Request Queuing**: Serializes chat requests per session to prevent race conditions.
- **🛰️ Background Tasks**: Support for non-blocking command execution with asynchronous result reporting.
- **🔍 Advanced Search**: Integrated codebase search with support for file extensions and content grepping.
- **Portability First**: Absolute path-agnostic architecture—run SimpleClaw from any folder.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **npm / pnpm**: Latest
- **Ollama**: (Optional) For local model support

### Installation
SimpleClaw is calibrated with a single command:

1. Clone or download the repository.
2. Run the setup script:
   ```batch
   setup.bat
   ```
*This will install dependencies, recalibrate paths, build the project, and launch the UI.*

---

## 📖 Usage

### Web UI
Launch at `http://localhost:3000` (proxied via Vite).
- **Settings**: Manage API keys and Neural Configuration.
- **Mechanical Control**: Toggle the dedicated summarizer engine with one click.

### CLI
Interact directly from the terminal:
```batch
simpleclaw chat -m llama3.1 -q "Status report"
simpleclaw list
```

---

## 🏗️ Architecture
- **Backend**: Node.js & Express (TypeScript)
- **Frontend**: React & Vite
- **Data**: Transparent JSON-based storage (no cloud DB required).

## 🙏 Acknowledgments
SimpleClaw is proudly inspired by **[OpenClaw](https://github.com/openclaw/openclaw)**. We thank the community for their pioneering work.

**Contact**: [mhndayesh@gmail.com](mailto:mhndayesh@gmail.com)


