import { AuditEntry } from '../entities/audit-entry.js';
export interface AuditPort {
    log(entry: AuditEntry): Promise<void>;
    list(tenantId: string): Promise<AuditEntry[]>;
}
