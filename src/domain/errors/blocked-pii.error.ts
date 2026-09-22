import { DomainError } from './domain.error.js';

/**
 * CAPA: Domain
 * CUÁNDO: el sanitizer detecta un secreto que NO debe salir ni siquiera enmascarado
 *         (API keys, tokens). Enmascarar no basta: se aborta el caso de uso.
 *
 * FLUJO: RegexSanitizerAdapter.mask() → throw → UseCase no llama al LLM
 *        → Filter → HTTP 422
 */
export class BlockedPiiError extends DomainError {
  constructor(public readonly piiType: string) {
    super(
      `PII bloqueante detectada (${piiType}). El prompt no se envía a ningún modelo.`,
    );
  }
}
