import { CompletePromptUseCase } from '../../application/use-cases/complete-prompt.use-case.js';
import type { CompletePromptBody } from './complete-prompt.body.js';
export declare class CompletionController {
    private readonly completePrompt;
    constructor(completePrompt: CompletePromptUseCase);
    complete(body: CompletePromptBody, tenantHeader?: string): Promise<{
        output: string;
        outputMasked: string;
        modelUsed: import("../../domain/entities/routing-decision.js").ModelName;
        complexityScore: number;
        reason: string;
        fromCache: boolean;
        redactions: string[];
        usage: {
            inputTokens: number;
            outputTokens: number;
            usd: number;
        };
        budgetRemainingUsd: number;
    }>;
}
export declare class HealthController {
    info(): {
        name: string;
        idea: string;
        flujo: string[];
        endpoints: {
            'POST /v1/completions': string;
            'GET /v1/budget': string;
            'GET /v1/audit': string;
        };
        lee: string;
    };
}
