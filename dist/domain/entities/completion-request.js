export class CompletionRequest {
    tenantId;
    prompt;
    hydrate;
    constructor(tenantId, prompt, hydrate = false) {
        this.tenantId = tenantId;
        this.prompt = prompt;
        this.hydrate = hydrate;
    }
}
//# sourceMappingURL=completion-request.js.map