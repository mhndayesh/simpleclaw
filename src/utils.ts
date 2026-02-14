import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root is one level up from src/
export const PROJECT_ROOT = join(__dirname, '..');

export function getProjectRoot(): string {
    return PROJECT_ROOT;
}

export function ensureDir(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}
