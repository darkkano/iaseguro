import { Injectable, Logger } from '@nestjs/common';
import type {
  LlmCompletion,
  LlmProviderPort,
} from '../../domain/ports/llm-provider.port.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';

/**
 * ADAPTER driven — modelos CAROS (GPT-4o / mini)
 *
 * FLUJO:
 *   LlmRouterAdapter  →  este complete()
 *
 * PRÁCTICA: no llama a OpenAI. El texto deja claro qué modelo se habría usado.
 * Producción: fetch https://api.openai.com/v1/chat/completions
 *             y NUNCA mandes el prompt original (el use case ya lo enmascaró).
 */
@Injectable()
export class OpenAiAdapter implements LlmProviderPort {
  private readonly logger = new Logger(OpenAiAdapter.name);

  async complete(input: {
    model: ModelName;
    prompt: string;
  }): Promise<LlmCompletion> {
    this.logger.log(
      `[OpenAiAdapter] modelo=${input.model} prompt masked (${input.prompt.length} chars)`,
    );
    return {
      text: `[${input.model}] (modelo de pago, simulado) Recibí SOLO texto enmascarado: ${input.prompt}`,
      inputTokens: Math.max(1, Math.ceil(input.prompt.length / 4)),
      outputTokens: input.model === 'gpt-4o' ? 48 : 32,
    };
  }
}
