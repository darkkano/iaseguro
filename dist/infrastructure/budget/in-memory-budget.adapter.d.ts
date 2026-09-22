import type { BudgetPort, BudgetStatus } from '../../domain/ports/budget.port.js';
export declare class InMemoryBudgetAdapter implements BudgetPort {
    static readonly LIMIT_USD = 0.05;
    private readonly spent;
    canSpend(tenantId: string, estimatedUsd: number): Promise<boolean>;
    addSpend(tenantId: string, usd: number): Promise<void>;
    getStatus(tenantId: string): Promise<BudgetStatus>;
}
