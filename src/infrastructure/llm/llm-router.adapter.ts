import { Injectable, Logger } from '@nestjs/common';
import type {
  LlmCompletion,
  LlmProviderPort,
} from '../../domain/ports/llm-provider.port.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';
import { LlamaAdapter } from './llama.adapter.js';
import { OpenAiAdapter } from './openai.adapter.js';

/**
 * ADAPTER driven que el use case SÍ ve (puerto LlmProviderPort).
 *
 * FLUJO:
 *   UseCase.llm.complete({ model, prompt })
 *     → este router
 *       → LlamaAdapter    si model === 'llama3'
 *       → OpenAiAdapter   si model === 'gpt-4o' | 'gpt-4o-mini'
 *
 * Así el dominio tiene UN puerto, no dos. El "switch" de proveedor es infra.
 */
@Injectable()
export class LlmRouterAdapter implements LlmProviderPort {
  private readonly logger = new Logger(LlmRouterAdapter.name);

  constructor(
    private readonly llama: LlamaAdapter,
    private readonly openai: OpenAiAdapter,
  ) {}

  complete(input: {
    model: ModelName;
    prompt: string;
  }): Promise<LlmCompletion> {
    this.logger.log(`[LlmRouter] despachar a ${input.model}`);
    if (input.model === 'llama3') {
      return this.llama.complete(input);
    }
    return this.openai.complete(input);
  }
}
