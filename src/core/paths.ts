import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Determines the absolute project root directory.
 * Priority:
 * 1. process.env.SIMPLECLAW_ROOT (explicitly set via setup/env)
 * 2. Directory containing package.json (climb up from this file)
 * 3. FALLBACK: process.cwd()
 */
export function getProjectRoot(): string {
    if (process.env.SIMPLECLAW_ROOT) {
        return path.resolve(process.env.SIMPLECLAW_ROOT);
    }

    try {
        // __dirname equivalent for ES modules
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // We are in src/core/, so root is 2 levels up
        return path.resolve(__dirname, '..', '..');
    } catch {
        return process.cwd();
    }
}
