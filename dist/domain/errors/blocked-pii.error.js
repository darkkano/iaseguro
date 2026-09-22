import { DomainError } from './domain.error.js';
export class BlockedPiiError extends DomainError {
    piiType;
    constructor(piiType) {
        super(`PII bloqueante detectada (${piiType}). El prompt no se envía a ningún modelo.`);
        this.piiType = piiType;
    }
}
//# sourceMappingURL=blocked-pii.error.js.map