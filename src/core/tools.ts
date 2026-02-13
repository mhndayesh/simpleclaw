import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';

const execPromise = promisify(exec);

export async function executeTool(command: string): Promise<string> {
    console.log(chalk.magenta(`\n[Executing Tool]: ${command}`));
    try {
        const { stdout, stderr } = await execPromise(command);
        return (stdout || '') + (stderr || '') || 'Success (no output)';
    } catch (error: any) {
        return `Execution failed: ${error.message}`;
    }
}

export async function writeTool(filePath: string, content: string): Promise<string> {
    console.log(chalk.cyan(`\n[Writing File]: ${filePath}`));
    try {
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
        const dir = path.dirname(absolutePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(absolutePath, content.trim(), 'utf-8');
        return `Successfully wrote to ${filePath}`;
    } catch (error: any) {
        return `Failed to write file: ${error.message}`;
    }
}

export function extractCommands(text: string): string[] {
    const regex = /<EXEC>(.*?)<\/EXEC>/gs;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]!.trim());
    }
    return matches;
}

export function extractWriteCommands(text: string): { path: string, content: string }[] {
    const regex = /<WRITE\s+path=["'](.*?)["']>(.*?)<\/WRITE>/gs;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push({ path: match[1]!.trim(), content: match[2]! });
    }
    return matches;
}
