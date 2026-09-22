import { RoutingDecision } from './entities/routing-decision.js';
export function decideModel(score) {
    if (score >= 5) {
        return new RoutingDecision('gpt-4o', score, 'Alta complejidad: razonamiento / arquitectura / refactor.');
    }
    if (score >= 3) {
        return new RoutingDecision('gpt-4o-mini', score, 'Complejidad media: comparar o explicar.');
    }
    return new RoutingDecision('llama3', score, 'Baja complejidad: saludo, resumen corto, formato.');
}
export const MODEL_COST_USD = {
    llama3: 0.0001,
    'gpt-4o-mini': 0.002,
    'gpt-4o': 0.01,
};
export function estimateCost(model) {
    return MODEL_COST_USD[model];
}
//# sourceMappingURL=routing-policy.js.map