// Description: Headless browser tool. Usage: node tools/browse.js <url> [screenshot_path]
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2];
const screenshotPath = process.argv[3];

if (!url) {
    console.error('Usage: node tools/browse.js <url> [screenshot_path]');
    process.exit(1);
}

(async () => {
    try {
        console.error(`[Browser] Launching...`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set a reasonable viewport
        await page.setViewport({ width: 1280, height: 800 });

        console.error(`[Browser] Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const title = await page.title();
        console.error(`[Browser] Title: ${title}`);

        if (screenshotPath) {
            console.error(`[Browser] Taking screenshot to ${screenshotPath}...`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
        }

        // Output HTML content to stdout
        const content = await page.content();
        console.log(content);

        await browser.close();
        console.error(`[Browser] Done.`);
    } catch (error) {
        console.error(`[Browser] Error: ${error.message}`);
        process.exit(1);
    }
})();
