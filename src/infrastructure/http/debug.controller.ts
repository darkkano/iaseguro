import { Controller, Get, Headers, Inject } from '@nestjs/common';
import type { AuditPort } from '../../domain/ports/audit.port.js';
import type { BudgetPort } from '../../domain/ports/budget.port.js';
import { AUDIT, BUDGET } from '../../domain/ports/tokens.js';

/**
 * ADAPTER driving de apoyo (no es el caso de uso principal).
 *
 * FLUJO:
 *   GET /v1/budget  →  BudgetPort.getStatus
 *   GET /v1/audit   →  AuditPort.list
 *
 * Sirve para VER el estado interno durante la práctica
 * (cuánto gastaste, qué prompts masked se loguearon).
 */
@Controller('v1')
export class DebugController {
  constructor(
    @Inject(BUDGET) private readonly budget: BudgetPort,
    @Inject(AUDIT) private readonly audit: AuditPort,
  ) {}

  @Get('budget')
  budgetStatus(@Headers('x-tenant-id') tenantHeader?: string) {
    const tenantId = tenantHeader?.trim() || 'demo';
    return this.budget.getStatus(tenantId);
  }

  @Get('audit')
  auditLog(@Headers('x-tenant-id') tenantHeader?: string) {
    const tenantId = tenantHeader?.trim() || 'demo';
    return this.audit.list(tenantId);
  }
}
