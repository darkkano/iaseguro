import { DomainError } from './domain.error.js';
export declare class BlockedPiiError extends DomainError {
    readonly piiType: string;
    constructor(piiType: string);
}
