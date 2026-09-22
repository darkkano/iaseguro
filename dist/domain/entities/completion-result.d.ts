import { ModelName } from './routing-decision.js';
export declare class CompletionResult {
    readonly text: string;
    readonly model: ModelName;
    readonly score: number;
    readonly reason: string;
    readonly fromCache: boolean;
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly usd: number;
    readonly redactions: string[];
    readonly budgetRemainingUsd: number;
    readonly maskedText: string;
    constructor(text: string, model: ModelName, score: number, reason: string, fromCache: boolean, inputTokens: number, outputTokens: number, usd: number, redactions: string[], budgetRemainingUsd: number, maskedText: string);
}
