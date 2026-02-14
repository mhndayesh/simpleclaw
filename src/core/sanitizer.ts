/**
 * Simple sanitizer utility for cleaning LLM responses.
 * Removes internal technical tags while preserving the core message.
 */

export function stripInternalTags(text: string): string {
    if (!text) return '';

    // Remove XML-style tags: <EXEC>, <WRITE>, and <thinking>
    // We use non-greedy matching to avoid over-stripping
    let cleaned = text
        .replace(/<EXEC>[\s\S]*?<\/EXEC>/gi, '')
        .replace(/<WRITE\s+path=["'](.*?)["']>[\s\S]*?<\/WRITE>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

    // Cleanup empty lines left behind by the removal
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

    return cleaned;
}

/**
 * Formats log output for better readability.
 * Truncates long JSON strings or binary-heavy output.
 */
export function formatLogOutput(text: string): string {
    if (!text) return 'Success (no output)';

    // If it looks like a long JSON block, summarize it
    if (text.length > 500 && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        return `[Large Data Block] ${text.substring(0, 100)}... (+${text.length - 100} chars)`;
    }

    return text.trim();
}
