import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const storageDir = path.join(projectRoot, 'storage');
const envDir = path.join(projectRoot, 'env');
const dotenvFile = path.join(projectRoot, '.env');
const configFile = path.join(projectRoot, 'config.json');
const configDefaultFile = path.join(projectRoot, 'config.default.json');

console.log('--- Project Sanitization Start ---');

// 1. Clear Session Data (storage/*.json)
if (fs.existsSync(storageDir)) {
    console.log('[Sanitize] Cleaning storage directory...');
    const files = fs.readdirSync(storageDir);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(storageDir, file));
            console.log(`  - Deleted: ${file}`);
        }
    });
}

// 2. Clear API Keys (env/*.txt)
if (fs.existsSync(envDir)) {
    console.log('[Sanitize] Cleaning secrets directory...');
    const files = fs.readdirSync(envDir);
    files.forEach(file => {
        if (file.endsWith('.txt')) {
            fs.unlinkSync(path.join(envDir, file));
            console.log(`  - Deleted: ${file}`);
        }
    });
}

// 3. Delete .env (Absolute paths)
if (fs.existsSync(dotenvFile)) {
    fs.unlinkSync(dotenvFile);
    console.log('[Sanitize] Deleted .env (environment-specific calibration)');
}

// 4. Reset config.json to defaults
if (fs.existsSync(configDefaultFile)) {
    fs.copyFileSync(configDefaultFile, configFile);
    console.log('[Sanitize] Reset config.json to defaults from config.default.json');
}

// 5. Cleanup Temporary Folders and Files
console.log('[Sanitize] Checking for temporary root artifacts...');
const rootFiles = fs.readdirSync(projectRoot);
rootFiles.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    const stats = fs.statSync(fullPath);

    // Remove empty numeric folders (like '6', '857')
    if (stats.isDirectory() && /^\d+$/.test(file)) {
        fs.rmdirSync(fullPath);
        console.log(`  - Removed empty directory: ${file}`);
    }

    // Remove backup folders
    if (stats.isDirectory() && file.startsWith('backup_')) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  - Removed backup folder: ${file}`);
    }

    // Remove stray test files
    if (stats.isFile() && (file === 'hello.txt' || file === 'pnpm-lock.yaml')) {
        fs.unlinkSync(fullPath);
        console.log(`  - Removed stray file: ${file}`);
    }
});

console.log('--- Project Sanitization Complete ---');

console.log('Project is now stripped of personal data and ready for publishing.');
