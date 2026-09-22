import { ModelName, RoutingDecision } from './entities/routing-decision.js';
export declare function decideModel(score: number): RoutingDecision;
export declare const MODEL_COST_USD: Record<ModelName, number>;
export declare function estimateCost(model: ModelName): number;
