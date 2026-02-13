import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const selectorPath = path.join(__dirname, '../ui/mode-selector-standalone.html');

// Try to open the file in the default browser
console.log("🌐 Attempting to open mode selector in browser...");

if (process.platform === 'win32') {
    // Windows
    exec(`start "" "${selectorPath}"`, (error) => {
        if (error) {
            console.log("❌ Could not open automatically. Manual steps:");
            console.log(`1. Open file explorer to: ${__dirname}/../ui/`);
            console.log(`2. Double-click: mode-selector-standalone.html`);
        } else {
            console.log("✅ Opened in browser!");
        }
    });
} else if (process.platform === 'darwin') {
    // Mac
    exec(`open "${selectorPath}"`);
} else {
    // Linux
    exec(`xdg-open "${selectorPath}"`);
}

console.log(`📍 File location: ${selectorPath}`);