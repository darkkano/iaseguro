import { Injectable, Logger } from '@nestjs/common';
import type {
  LlmCompletion,
  LlmProviderPort,
} from '../../domain/ports/llm-provider.port.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';

/**
 * ADAPTER driven — modelo BARATO (Llama 3)
 *
 * FLUJO:
 *   LlmRouterAdapter  →  este complete()
 *                     ←  texto simulado
 *
 * PRÁCTICA: no llama a Ollama de verdad.
 * Cuando quieras lo real, sustituye el return por:
 *   POST http://localhost:11434/api/generate  { model: "llama3", prompt }
 */
@Injectable()
export class LlamaAdapter implements LlmProviderPort {
  private readonly logger = new Logger(LlamaAdapter.name);

  async complete(input: {
    model: ModelName;
    prompt: string;
  }): Promise<LlmCompletion> {
    this.logger.log(`[LlamaAdapter] prompt masked recibido (${input.prompt.length} chars)`);
    return {
      text: `[llama3] (modelo barato, simulado) Recibí SOLO texto enmascarado: ${input.prompt}`,
      inputTokens: estimateTokens(input.prompt),
      outputTokens: 24,
    };
  }
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
