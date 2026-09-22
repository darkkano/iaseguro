import type { LlmCompletion, LlmProviderPort } from '../../domain/ports/llm-provider.port.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';
export declare class OpenAiAdapter implements LlmProviderPort {
    private readonly logger;
    complete(input: {
        model: ModelName;
        prompt: string;
    }): Promise<LlmCompletion>;
}
