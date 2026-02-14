# Fresh Start — Modes & Tools Map

This file is included in the system prompt for every new session. Keep it updated when you add new modes or tools.

## Modes (short descriptions)
- `super-eco`: Direct-answer mode. Concise summaries (last 3 user turns verbatim), tool access ENABLED for operational utility.
- `standard`: Balanced operational mode. 10 raw user turns, full tool access including background execution.
- `full-context`: Expert mode. Full history preserved, proactive tool use and high-reasoning.

## Tools map (current)
- `tools/*.js` — executable helper scripts. **MUST USE ESM (import/export)**.
- `docs/TOOL_MAKING_GUIDE.md` — MUST READ this before creating new tools.
- `core/tools.ts` — host implementation for `<EXEC>`, `<WRITE>`, and `<BACKGROUND_EXEC>`.
- `storage/session_<id>.json` — per-session conversation history.

## Updating this file
- When you add a new tool, append its name, path, and short description here.
- When you add a new mode, append the mode name and a brief description and where it's implemented.

Path: `fresh-start.md`

Do not remove this file; it is referenced by the system prompt for fresh sessions.

## Compaction rules (how memory is trimmed per mode)

- `super-eco`: Aggressive compaction to save tokens. The system will summarize older conversation into short system-summary messages and keep only the last 3 user requests verbatim. Summaries use short truncated snippets (about 10 words each).

- `standard`: Moderate compaction. The system will summarize older conversation into system-summary messages but will keep the last 10 user requests verbatim. Summaries are slightly more detailed (around 18 words each) and group older user turns in batches of ~5 when summarizing.

- `full-context`: No compaction. The assistant keeps the entire conversation history intact for maximum context.

These rules are applied automatically by the server when saving session memory. They are also included in the agent's system prompt so the assistant knows how to behave under each mode.
