/**
 * DTO de infraestructura (HTTP).
 *
 * FLUJO:
 *   JSON del cliente  →  este shape
 *   CompletionController lo traduce a CompletionRequest (dominio)
 *
 * NO es OpenAPI. Es un contrato mínimo para la práctica.
 */
export interface CompletePromptBody {
  prompt: string;
  /** true = la respuesta trae valores reales en vez de {{TOKEN}} */
  hydrate?: boolean;
}
