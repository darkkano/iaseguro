import { Injectable } from '@nestjs/common';
import { AuditEntry } from '../../domain/entities/audit-entry.js';
import type { AuditPort } from '../../domain/ports/audit.port.js';

/**
 * ADAPTER driven — audit en RAM
 * IMPLEMENTA: AuditPort
 *
 * FLUJO:
 *   UseCase.audit.log(entrada con prompt MASKED)
 *   GET /v1/audit → list(tenant)
 *
 * Mañana: tabla SQLite + Drizzle, igual que el repo de Products del diagrama.
 */
@Injectable()
export class InMemoryAuditAdapter implements AuditPort {
  private readonly entries: AuditEntry[] = [];

  async log(entry: AuditEntry): Promise<void> {
    this.entries.push(entry);
  }

  async list(tenantId: string): Promise<AuditEntry[]> {
    return this.entries.filter((e) => e.tenantId === tenantId);
  }
}
