import { SessionMemory } from './memory.js';
import chalk from 'chalk';

export class ContextGuard {
    private readonly MAX_TOKENS_DEFAULT = 12000; // Safe default for many local models
    private readonly WARNING_THRESHOLD = 0.8;
    private readonly COMPACTION_THRESHOLD = 0.9;
    private maxTokens: number;

    constructor(private memory: SessionMemory, maxTokens: number = 12000) {
        this.maxTokens = maxTokens;
    }

    /**
     * Estimates token count (approx 4 chars per token).
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /**
     * Checks current context usage and performs compaction if necessary.
     * Returns true if request can proceed, false if blocked (should rarely block if compaction works).
     */
    async checkAndCompact(): Promise<void> {
        const history = this.memory.getHistory();
        const fullText = history.map(m => m.content).join(' ');
        const currentTokens = this.estimateTokens(fullText);
        const usageRatio = currentTokens / this.maxTokens;

        if (usageRatio > this.WARNING_THRESHOLD) {
            console.log(chalk.yellow(`[ContextGuard] Warning: Context usage at ${(usageRatio * 100).toFixed(1)}% (${currentTokens}/${this.maxTokens})`));
        }

        if (usageRatio > this.COMPACTION_THRESHOLD) {
            console.log(chalk.red(`[ContextGuard] Critical: Context usage at ${(usageRatio * 100).toFixed(1)}%. Initiating compaction...`));
            await this.compact();
        }
    }

    /**
     * Compacts the session memory by summarizing older turns.
     * Heavily aggregates user/assistant pairs into system summaries.
     */
    private async compact(): Promise<void> {
        const history = this.memory.getHistory();

        // Preserve system prompt (usually first system message)
        const systemMsg = history.find(m => m.role === 'system');

        // Filter out the system prompt from the rest to avoid duplication/deletion
        const others = history.filter(m => m !== systemMsg);

        // Keep the last 4 messages raw (recent context)
        const recentCount = 4;
        if (others.length <= recentCount) return;

        const toSummarize = others.slice(0, others.length - recentCount);
        const toKeep = others.slice(others.length - recentCount);

        // Simple aggregation summary
        const summaryText = toSummarize
            .map(m => {
                const role = m.role ? m.role.toUpperCase() : 'UNKNOWN';
                const content = m.content ? m.content.substring(0, 100) : '';
                return `${role}: ${content}...`;
            })
            .join(' | ');

        const compactionMsg = {
            role: 'system' as const,
            content: `[Previous Context Summary]: ${summaryText}`
        };

        this.memory.clear();
        if (systemMsg) this.memory.addMessage(systemMsg);
        this.memory.addMessage(compactionMsg);
        toKeep.forEach(m => this.memory.addMessage(m));

        await this.memory.save();
        console.log(chalk.green(`[ContextGuard] Compaction complete. Reduced from ${history.length} to ${this.memory.getHistory().length} messages.`));
    }
}
