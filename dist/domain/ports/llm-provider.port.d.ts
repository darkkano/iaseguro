import { ModelName } from '../entities/routing-decision.js';
export interface LlmCompletion {
    text: string;
    inputTokens: number;
    outputTokens: number;
}
export interface LlmProviderPort {
    complete(input: {
        model: ModelName;
        prompt: string;
    }): Promise<LlmCompletion>;
}
