export declare class CompletionRequest {
    readonly tenantId: string;
    readonly prompt: string;
    readonly hydrate: boolean;
    constructor(tenantId: string, prompt: string, hydrate?: boolean);
}
