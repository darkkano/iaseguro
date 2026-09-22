import type { LlmCompletion, LlmProviderPort } from '../../domain/ports/llm-provider.port.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';
import { LlamaAdapter } from './llama.adapter.js';
import { OpenAiAdapter } from './openai.adapter.js';
export declare class LlmRouterAdapter implements LlmProviderPort {
    private readonly llama;
    private readonly openai;
    private readonly logger;
    constructor(llama: LlamaAdapter, openai: OpenAiAdapter);
    complete(input: {
        model: ModelName;
        prompt: string;
    }): Promise<LlmCompletion>;
}
