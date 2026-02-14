import * as fs from 'fs/promises';
import * as path from 'path';
import { getProjectRoot } from './paths.js';

const ROOT_DIR = getProjectRoot();
const SECRETS_DIR = path.join(ROOT_DIR, 'env');

export async function getSecret(name: string): Promise<string | undefined> {
    // Try env/ first, then process.env
    try {
        const filePath = path.join(SECRETS_DIR, `${name.toLowerCase()}.txt`);
        const content = await fs.readFile(filePath, 'utf-8');
        return content.trim();
    } catch {
        return process.env[name.toUpperCase()];
    }
}
