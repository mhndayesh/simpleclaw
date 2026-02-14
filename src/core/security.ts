import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';

export class SecurityManager {
    private interactive: boolean;
    private projectRoot: string;
    private enabled: boolean = true;

    // Known safe commands that don't need approval
    private allowList = [
        'ls', 'dir', 'echo', 'cat', 'type', 'pwd', 'cd', 'mkdir', 'grep', 'find'
    ];

    constructor(interactive: boolean = false, projectRoot: string = process.cwd()) {
        this.interactive = interactive;
        this.projectRoot = path.resolve(projectRoot);
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            console.log(chalk.red('[Security] WARNING: Security checks have been DISABLED via configuration.'));
        }
    }

    /**
     * Checks if a command is in the allowlist.
     * Simple check: cmd starts with allowed command and is not chained with &&, ||, ;
     */
    isCommandSafe(cmd: string): boolean {
        const trimmed = cmd.trim();
        // Check for command chaining or pipes which might hide dangerous ops
        if (/[;&|]/.test(trimmed)) return false;

        const firstWord = (trimmed.split(' ')[0] || '').trim();
        return this.allowList.includes(firstWord);
    }

    isWriteSafe(filePath: string): boolean {
        const resolved = path.resolve(this.projectRoot, filePath);
        return resolved.startsWith(this.projectRoot);
    }

    async validateCommand(cmd: string): Promise<boolean> {
        if (!this.enabled) return true;

        if (this.isCommandSafe(cmd)) {
            return true;
        }

        if (!this.interactive) {
            // Server mode: Block risky commands unless explicitly overridden
            // For now, we block all non-allowlist commands in server mode for safety
            // TODO: Add config for DANGEROUS_OPEN_INTERPRETER_MODE
            console.log(chalk.red(`[Security] Blocked execution of risky command in non-interactive mode: ${cmd}`));
            return false;
        }

        // CLI mode: Ask user
        console.log(chalk.yellow(`\n[Security] The agent wants to execute: ${chalk.bold(cmd)}`));
        const answers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'allow',
                message: 'Do you want to allow this execution?',
                default: false
            }
        ]);
        return answers.allow;
    }

    async validateWrite(filePath: string): Promise<boolean> {
        if (!this.enabled) return true;

        if (!this.isWriteSafe(filePath)) {
            console.log(chalk.red(`[Security] Blocked write attempt outside project root: ${filePath}`));
            return false;
        }
        return true;
    }
}

// Singleton instance to be initialized by entry points
export let security: SecurityManager;

export function initSecurity(interactive: boolean, root: string = process.cwd()) {
    security = new SecurityManager(interactive, root);
}
