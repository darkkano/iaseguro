import { AuditEntry } from '../../domain/entities/audit-entry.js';
import type { AuditPort } from '../../domain/ports/audit.port.js';
export declare class InMemoryAuditAdapter implements AuditPort {
    private readonly entries;
    log(entry: AuditEntry): Promise<void>;
    list(tenantId: string): Promise<AuditEntry[]>;
}
