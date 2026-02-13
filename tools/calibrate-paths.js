import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const envPath = path.join(projectRoot, '.env');

console.log(`[Calibrate] Detected project root: ${projectRoot}`);

let content = '';
if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
}

// Remove existing SIMPLECLAW_ROOT if it exists
content = content.split('\n')
    .filter(line => !line.startsWith('SIMPLECLAW_ROOT='))
    .join('\n');

// Append new root
const newContent = (content.trim() + `\nSIMPLECLAW_ROOT=${projectRoot}\n`).trim();

fs.writeFileSync(envPath, newContent, 'utf-8');
console.log(`[Calibrate] Updated ${envPath} with absolute root path.`);
