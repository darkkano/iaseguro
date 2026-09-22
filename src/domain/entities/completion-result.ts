import { ModelName } from './routing-decision.js';

/**
 * CAPA: Domain / Entidad de salida
 *
 * FLUJO (vuelta de la flecha ②):
 *   CompletePromptUseCase.execute  →  CompletionResult
 *   CompletionController           →  JSON HTTP
 */
export class CompletionResult {
  constructor(
    public readonly text: string,
    public readonly model: ModelName,
    public readonly score: number,
    public readonly reason: string,
    public readonly fromCache: boolean,
    public readonly inputTokens: number,
    public readonly outputTokens: number,
    public readonly usd: number,
    public readonly redactions: string[],
    public readonly budgetRemainingUsd: number,
    /** Texto tal como salió del LLM (con {{TOKENS}}). */
    public readonly maskedText: string,
  ) {}
}
