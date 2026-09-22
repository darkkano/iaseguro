export type ModelName = 'llama3' | 'gpt-4o-mini' | 'gpt-4o';
export declare class RoutingDecision {
    readonly model: ModelName;
    readonly score: number;
    readonly reason: string;
    constructor(model: ModelName, score: number, reason: string);
}
