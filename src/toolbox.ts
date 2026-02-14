import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getProjectRoot } from './utils.js';
import { System } from './system.js';

const execAsync = promisify(exec);

export class Toolbox {
    private toolsDir: string;

    constructor() {
        this.toolsDir = path.join(getProjectRoot(), 'tools');
    }

    public getToolsList(): string {
        try {
            if (!fs.existsSync(this.toolsDir)) return '';

            const getFiles = (dir: string) => {
                if (!fs.existsSync(dir)) return [];
                return fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => path.join(dir, f));
            };

            const mainTools = getFiles(this.toolsDir);
            const tempTools = getFiles(path.join(this.toolsDir, 'temp'));
            const allTools = [...mainTools, ...tempTools];

            return allTools.map(fullPath => {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const firstLine = (content.split('\n')[0] || '').replace('//', '').trim();
                const relativeName = path.relative(this.toolsDir, fullPath).replace(/\\/g, '/');
                return `- **${relativeName}**: ${firstLine}`;
            }).join('\n');
        } catch {
            return '';
        }
    }

    public async executeCommand(command: string): Promise<string> {
        const sys = System.getInstance();

        // Security Check
        if (sys.isSecurityEnabled()) {
            // Simple allowlist check for demo purposes
            const safe = ['ls', 'dir', 'echo', 'node tools/'];
            const isSafe = safe.some(s => command.startsWith(s));
            if (!isSafe) {
                return 'EXECUTION DENIED: Command not in allowlist (Security Enabled).';
            }
        } else {
            // GOD MODE: No restrictions.
        }

        try {
            console.log(`[EXEC] ${command}`);
            const { stdout, stderr } = await execAsync(command, { cwd: getProjectRoot() });
            return (stdout || stderr) || 'Command completed with no output.';
        } catch (error: any) {
            return `Execution failed: ${error.message}`;
        }
    }

    public async readTool(filePath: string): Promise<string> {
        try {
            const fullPath = path.join(getProjectRoot(), filePath);
            if (!fs.existsSync(fullPath)) return `Error: File ${filePath} not found.`;
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) return `Error: ${filePath} is a directory. Use LIST instead.`;

            return fs.readFileSync(fullPath, 'utf-8');
        } catch (error: any) {
            return `Read failed: ${error.message}`;
        }
    }

    public async listTool(dirPath: string): Promise<string> {
        try {
            const fullPath = path.join(getProjectRoot(), dirPath);
            if (!fs.existsSync(fullPath)) return `Error: Directory ${dirPath} not found.`;

            const files = fs.readdirSync(fullPath);
            return files.map(f => {
                const isDir = fs.statSync(path.join(fullPath, f)).isDirectory();
                return isDir ? `[DIR] ${f}` : f;
            }).join('\n');
        } catch (error: any) {
            return `List failed: ${error.message}`;
        }
    }

    public async writeTool(filePath: string, content: string): Promise<string> {
        try {
            const fullPath = path.join(getProjectRoot(), filePath);
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(fullPath, content);
            return `Successfully wrote to ${filePath}`;
        } catch (error: any) {
            return `Write failed: ${error.message}`;
        }
    }
}
