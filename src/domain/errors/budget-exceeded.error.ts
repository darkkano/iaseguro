import { DomainError } from './domain.error.js';

/**
 * CAPA: Domain
 * CUÁNDO: el tenant no tiene saldo estimado suficiente para el modelo elegido.
 *
 * FLUJO: CompletePromptUseCase (paso 5) → throw → Filter → HTTP 402
 *
 * En un producto real podrías degradar a Llama 3 en vez de fallar.
 * Aquí fallamos a propósito para que se vea la regla de negocio.
 */
export class BudgetExceededError extends DomainError {
  constructor(tenantId: string, model: string) {
    super(
      `Presupuesto agotado para tenant="${tenantId}" al intentar usar modelo="${model}".`,
    );
  }
}
