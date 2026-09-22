import { ModelName } from './routing-decision.js';
export declare class AuditEntry {
    readonly at: string;
    readonly tenantId: string;
    readonly promptMasked: string;
    readonly model: ModelName;
    readonly fromCache: boolean;
    readonly usd: number;
    constructor(at: string, tenantId: string, promptMasked: string, model: ModelName, fromCache: boolean, usd: number);
}
