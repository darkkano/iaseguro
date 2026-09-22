import { ModelName } from './routing-decision.js';

/**
 * CAPA: Domain / Value object de auditoría
 *
 * REGLA: `prompt` aquí ya viene ENMASCARADO.
 *         Si ves una tarjeta real en el audit, el sanitizer falló.
 */
export class AuditEntry {
  constructor(
    public readonly at: string,
    public readonly tenantId: string,
    public readonly promptMasked: string,
    public readonly model: ModelName,
    public readonly fromCache: boolean,
    public readonly usd: number,
  ) {}
}
