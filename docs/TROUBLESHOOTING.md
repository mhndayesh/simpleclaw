# Troubleshooting Guide

Common issues and how to resolve them.

## 1. "Model Not Found"
**Symptoms**: CLI or UI reports the model is missing even if it's in the list.
- **Cause**: The API keys might be missing or expired.
- **Fix**: Check `env/openrouter.txt` or `env/hf.txt`. Ensure your keys have balance/quota.

## 2. API Server Won't Start (Port Conflict)
**Symptoms**: `npm start` or `setup.bat` fails to launch the backend.
- **Cause**: Another service is likely using port `3001`.
- **Fix**: Either close the application using port 3001 or set a custom `PORT` environment variable before launching.

## 3. Ollama Models Not Appearing
**Symptoms**: You have Ollama installed, but `simpleclaw list` only shows remote models.
- **Cause**: Ollama is not running or is blocked by a firewall.
- **Fix**: Run `ollama list` in your terminal to verify it's active. Ensure SimpleClaw has permission to access `localhost:11434`.

## 4. "Root Calibration" Error
**Symptoms**: SimpleClaw reports it cannot find its files after being moved to a new folder.
- **Cause**: The `.env` file still contains the path to the old folder.
- **Fix**: Run `setup.bat` again. It will automatically recalibrate the project to the new location.

## 5. UI Setup Wizard Keeps Appearing
**Symptoms**: Every time you refresh the browser, you are asked to select models again.
- **Cause**: The "Setup Complete" flag is not saving to [config.json](file:///c:/simpleclaw/config.json).
- **Fix**: Check if `config.json` is write-protected or if the `storage/` directory has proper permissions.

---

## Still having issues?
Run the project in debug mode to see detailed logs:
```batch
npm run dev
```
Check the terminal output for red "Error" lines.
