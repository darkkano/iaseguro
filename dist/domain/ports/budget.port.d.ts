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
