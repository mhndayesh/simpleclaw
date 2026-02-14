import fs from 'fs';
import path from 'path';

/**
 * Changes the operating mode of SimpleClaw.
 * Usage: node tools/switch-mode.js <eco|standard|full>
 */

const mode = process.argv[2];
const validModes = ['eco', 'standard', 'full', 'super-eco'];

if (!mode || !validModes.includes(mode)) {
    console.error(`Error: Invalid mode. Use: ${validModes.join(', ')}`);
    process.exit(1);
}

// In this refactored version, we'll store the mode in a simple file 
// that the backend can read to adjust its behavior/prompt.
// Note: App.jsx ALSO holds a mode in localStorage, but for the Agent's actual brain context,
// we want the backend to be aware.

const configPath = path.join(process.cwd(), 'config.json');
try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.activeMode = mode;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Successfully switched to ${mode} mode.`);
} catch (e) {
    console.error('Failed to update config.json:', e.message);
}
