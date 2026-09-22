import { AuditEntry } from '../entities/audit-entry.js';

/**
 * PUERTO driven.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/audit/*
 *
 * FLUJO:
 *   UseCase.log(entrada SIN PII)  →  memoria / mañana SQLite o Drizzle
 *   GET /v1/audit                 →  list(tenantId)
 */
export interface AuditPort {
  log(entry: AuditEntry): Promise<void>;
  list(tenantId: string): Promise<AuditEntry[]>;
}
