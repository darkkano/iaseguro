import type { AuditPort } from '../../domain/ports/audit.port.js';
import type { BudgetPort } from '../../domain/ports/budget.port.js';
export declare class DebugController {
    private readonly budget;
    private readonly audit;
    constructor(budget: BudgetPort, audit: AuditPort);
    budgetStatus(tenantHeader?: string): Promise<import("../../domain/ports/budget.port.js").BudgetStatus>;
    auditLog(tenantHeader?: string): Promise<import("../../domain/entities/audit-entry.js").AuditEntry[]>;
}
