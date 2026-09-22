/**
 * PUERTO driven.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/budget/*  (hoy: RAM; mañana: Redis INCR)
 *
 * FLUJO:
 *   antes del LLM: canSpend(tenant, estimado) → false = BudgetExceededError
 *   después:       addSpend(tenant, usd)
 *   debug HTTP:    getStatus(tenant)
 */
export interface BudgetStatus {
  spentUsd: number;
  limitUsd: number;
  remainingUsd: number;
}

export interface BudgetPort {
  canSpend(tenantId: string, estimatedUsd: number): Promise<boolean>;
  addSpend(tenantId: string, usd: number): Promise<void>;
  getStatus(tenantId: string): Promise<BudgetStatus>;
}
