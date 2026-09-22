/**
 * CAPA: Domain / Entidad
 * QUÉ: resultado de la política de costos (qué modelo usar y por qué).
 *
 * FLUJO:
 *   ClassifierPort.score(masked)  →  número
 *   decideModel(score)            →  RoutingDecision   ← función PURA de dominio
 *   LlmProviderPort.complete({ model: decision.model, prompt: masked })
 */
export type ModelName = 'llama3' | 'gpt-4o-mini' | 'gpt-4o';

export class RoutingDecision {
  constructor(
    public readonly model: ModelName,
    public readonly score: number,
    public readonly reason: string,
  ) {}
}
