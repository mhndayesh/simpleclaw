# Release Notes - v1.2.0 🦞

This release introduces major architectural improvements focusing on compute efficiency, session management, and user control.

## 🚀 What's New

### 🔘 Mechanical Summarizer Switch
- **Granular Compute Control**: You can now explicitly toggle between your primary model and a dedicated summarizer model for background memory compression.
- **Token Efficiency**: Redirect summarization tasks to local models (Ollama) or cheaper cloud models to save on your primary model's token budget.
- **UI Interaction**: A new, prominent **SWITCH ON/OFF** toggle in the Settings tab.

### 🧱 Tiered Memory Summarization
- **Mode-Specific Intensity**: Summarization prompts are now tailored to your active Neural Mode:
  - **Super-Eco**: Pin-point summaries (3 lines max).
  - **Eco**: Concise bullet points.
  - **Standard**: Detailed operational logs.
- **5-Turn Trigger**: Automated session cleaning every 5 turns to keep context windows short and performance high.

### 🛡️ Passive Isolation Protocol
- **Privacy First**: Every "New Session" or system reset now archives the existing summary and wipes active memory clean.
- **Session Archives**: History is preserved in `storage/sessions/*.json` with full usage statistics and step counts.
- **Opt-in History**: The agent is programmatically denied from accessing archives unless explicitly commanded by you.

## 🛠️ Maintenance & Refinement
- **Hardened Persistence**: Fixed a bug where UI configuration changes (Mechanical Switch status, Model selection) were not persisting correctly across sessions.
- **Lifecycle Scripts**: Updated `setup.bat` and `reset-system.bat` to handle the new session storage and tiered configuration requirements.
- **Expanded Documentation**: Comprehensive updates to the internal documentation suite (`ARCHITECTURE.md`, `NEURAL_MODES.md`, `FEATURES.md`).

---
**SimpleClaw is now more efficient, secure, and easier to control than ever!** 🏆🏛️🧱✨🦞🚀
