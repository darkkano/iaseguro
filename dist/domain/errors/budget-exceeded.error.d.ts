import { DomainError } from './domain.error.js';
export declare class BudgetExceededError extends DomainError {
    constructor(tenantId: string, model: string);
}
