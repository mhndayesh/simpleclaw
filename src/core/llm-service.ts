import chalk from 'chalk';
import type { Provider, ChatMessage, ModelMetadata } from '../providers/types.js';
import type { AppConfig } from './config.js';

export interface LLMResponse {
    content: string;
    modelUsed: string;
    providerUsed: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
}

export async function queryModelWithFallback(
    targetModelId: string,
    history: ChatMessage[],
    providers: Provider[],
    config: AppConfig
): Promise<LLMResponse> {

    // Helper to find a provider and model object for a given ID
    const findProvider = async (id: string) => {
        for (const p of providers) {
            // Optimization: Some providers might check validity without full discovery
            // But for now we stick to the existing pattern of discovery which ensures availability
            try {
                const models = await p.discoverModels();
                const found = models.find(m => m.id === id);
                if (found) return { provider: p, model: found };
            } catch (e) {
                // specific provider failure shouldn't crash the whole lookup
                continue;
            }
        }
        return null;
    };

    // 1. Try Primary
    let selected = await findProvider(targetModelId);

    // Special handling for hardcoded provider-specific IDs (like OpenRouter) if discovery didn't catch them
    // (This logic mirrors what was in server.ts)
    if (!selected && targetModelId.includes('/')) {
        const openRouter = providers.find(p => p.id === 'openrouter');
        if (openRouter) {
            selected = {
                provider: openRouter,
                model: {
                    id: targetModelId,
                    provider: 'openrouter',
                    name: targetModelId
                }
            };
        }
    }

    if (!selected) {
        // If primary not found, checks if we should fallback immediately or fail
        // If config has fallback and the requested model was NOT the fallback model (loop prevention)
        if (config.fallback?.model && targetModelId !== config.fallback.model) {
            console.log(chalk.yellow(`[LLM] Primary model "${targetModelId}" not found. Attempting fallback...`));
            return queryModelWithFallback(config.fallback.model, history, providers, config);
        }
        throw new Error(`Model "${targetModelId}" not found and no valid fallback available.`);
    }

    const { provider, model } = selected;

    try {
        console.log(chalk.blue(`[LLM] Generating with ${model.id} (${provider.id})...`));
        const response = await provider.chat(model.id, history);
        const result: LLMResponse = {
            content: response.content,
            modelUsed: model.id,
            providerUsed: provider.id,
        };

        if (response.usage) {
            result.usage = response.usage;
        }

        return result;
    } catch (error: any) {
        // 2. Handle Failure & Retry
        const isRetryable = isErrorRetryable(error);

        if (config.fallback?.model && targetModelId !== config.fallback.model && isRetryable) {
            console.log(chalk.yellow(`[LLM] Primary model failed: ${error.message}. Switching to fallback "${config.fallback.model}"...`));
            return queryModelWithFallback(config.fallback.model, history, providers, config);
        }

        // If not retryable or no fallback, rethrow
        throw error;
    }
}

function isErrorRetryable(error: any): boolean {
    const msg = error.message.toLowerCase();
    // Network errors
    if (msg.includes('fetch failed') || msg.includes('network error') || msg.includes('econnrefused')) return true;
    // Rate limits
    if (msg.includes('429') || msg.includes('rate limit')) return true;
    // Server errors
    if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('overloaded')) return true;
    // Context length? Maybe not retryable if fallback has smaller context, but often safe to try
    return false;
}
