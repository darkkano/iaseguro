import { ModelName, RoutingDecision } from './entities/routing-decision.js';

/**
 * CAPA: Domain / Política de negocio (sin Nest, sin Redis, sin HTTP)
 *
 * FLUJO:
 *   entra: score (número que calculó ClassifierPort en infra)
 *   sale:  RoutingDecision
 *
 * Esta función es el corazón del "enrutador de costos".
 * Si mañana cambias umbrales, se cambia AQUÍ, no en el controller.
 *
 * Tabla de práctica:
 *   0–2  → llama3       (barato / local)
 *   3–4  → gpt-4o-mini  (intermedio)
 *   ≥5   → gpt-4o       (caro)
 */
export function decideModel(score: number): RoutingDecision {
  if (score >= 5) {
    return new RoutingDecision(
      'gpt-4o',
      score,
      'Alta complejidad: razonamiento / arquitectura / refactor.',
    );
  }
  if (score >= 3) {
    return new RoutingDecision(
      'gpt-4o-mini',
      score,
      'Complejidad media: comparar o explicar.',
    );
  }
  return new RoutingDecision(
    'llama3',
    score,
    'Baja complejidad: saludo, resumen corto, formato.',
  );
}

/**
 * Costo estimado por request (USD) para la práctica.
 * En producción lo calcularías con tokens reales del adapter.
 */
export const MODEL_COST_USD: Record<ModelName, number> = {
  llama3: 0.0001,
  'gpt-4o-mini': 0.002,
  'gpt-4o': 0.01,
};

export function estimateCost(model: ModelName): number {
  return MODEL_COST_USD[model];
}
