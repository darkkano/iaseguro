import { DomainError } from './domain.error.js';
export class BudgetExceededError extends DomainError {
    constructor(tenantId, model) {
        super(`Presupuesto agotado para tenant="${tenantId}" al intentar usar modelo="${model}".`);
    }
}
//# sourceMappingURL=budget-exceeded.error.js.map