export class AuditEntry {
    at;
    tenantId;
    promptMasked;
    model;
    fromCache;
    usd;
    constructor(at, tenantId, promptMasked, model, fromCache, usd) {
        this.at = at;
        this.tenantId = tenantId;
        this.promptMasked = promptMasked;
        this.model = model;
        this.fromCache = fromCache;
        this.usd = usd;
    }
}
//# sourceMappingURL=audit-entry.js.map