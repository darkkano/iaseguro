/**
 * PUERTO driven.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/classifier/*
 *
 * FLUJO:
 *   UseCase  --pasa-->  texto YA enmascarado
 *            ←score--   número (0, 3, 5, …)
 *   UseCase  --pasa-->  decideModel(score)  ← dominio puro
 */
export interface ClassifierPort {
  score(maskedPrompt: string): number;
}
