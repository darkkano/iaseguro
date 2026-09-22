import { Injectable } from '@nestjs/common';
import type { BudgetPort, BudgetStatus } from '../../domain/ports/budget.port.js';

/**
 * ADAPTER driven — presupuesto en RAM
 * IMPLEMENTA: BudgetPort
 *
 * FLUJO:
 *   UseCase.canSpend  →  spent + estimado <= LIMIT
 *   UseCase.addSpend  →  spent += usd
 *   GET /v1/budget    →  getStatus
 *
 * LIMIT bajo a propósito ($0.05) para que en la práctica
 * puedas agotar el saldo con unos cuantos prompts "Analiza...".
 *
 * Mañana: Redis INCRBYFLOAT budget:{tenant}:{yyyymm}
 */
@Injectable()
export class InMemoryBudgetAdapter implements BudgetPort {
  /** Límite de práctica por tenant (USD). */
  static readonly LIMIT_USD = 0.05;

  private readonly spent = new Map<string, number>();

  async canSpend(tenantId: string, estimatedUsd: number): Promise<boolean> {
    const current = this.spent.get(tenantId) ?? 0;
    return current + estimatedUsd <= InMemoryBudgetAdapter.LIMIT_USD;
  }

  async addSpend(tenantId: string, usd: number): Promise<void> {
    const current = this.spent.get(tenantId) ?? 0;
    this.spent.set(tenantId, Number((current + usd).toFixed(6)));
  }

  async getStatus(tenantId: string): Promise<BudgetStatus> {
    const spentUsd = this.spent.get(tenantId) ?? 0;
    const limitUsd = InMemoryBudgetAdapter.LIMIT_USD;
    return {
      spentUsd,
      limitUsd,
      remainingUsd: Number((limitUsd - spentUsd).toFixed(6)),
    };
  }
}
