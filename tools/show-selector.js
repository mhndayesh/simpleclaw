import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const selectorPath = path.join(__dirname, '../ui/mode-selector-standalone.html');

try {
    const htmlContent = readFileSync(selectorPath, 'utf8');
    console.log("📁 Mode Selector HTML Content:");
    console.log("=".repeat(50));
    console.log(htmlContent);
    console.log("=".repeat(50));
    console.log("\n📍 File location: ui/mode-selector-standalone.html");
    console.log("🌐 Open this file in a web browser to see the mode selector!");
} catch (error) {
    console.log("❌ Error reading file:", error.message);
}