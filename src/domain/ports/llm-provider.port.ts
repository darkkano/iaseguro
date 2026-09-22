import { ModelName } from '../entities/routing-decision.js';

export interface LlmCompletion {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * PUERTO driven.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/llm/llm-router.adapter.ts
 *                 (que a su vez delega a llama.adapter / openai.adapter)
 *
 * FLUJO:
 *   UseCase  -- { model, prompt enmascarado } -->  LlmProviderPort
 *            ← { text, tokens }
 *
 * REGLA: `prompt` ya viene masked. Si un adapter recibe PII real, hay un bug
 *        en el use case, no en OpenAI.
 */
export interface LlmProviderPort {
  complete(input: { model: ModelName; prompt: string }): Promise<LlmCompletion>;
}
