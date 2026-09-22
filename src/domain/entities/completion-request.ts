/**
 * CAPA: Domain / Entidad de entrada
 *
 * FLUJO (flecha ② del hexágono):
 *   HTTP body + header  →  CompletionController
 *                       →  new CompletionRequest(...)
 *                       →  CompletePromptUseCase.execute(request)
 *
 * El dominio trabaja con esta clase, NUNCA con @Body() ni Express.
 */
export class CompletionRequest {
  constructor(
    public readonly tenantId: string,
    public readonly prompt: string,
    /** Si true, la respuesta sustituye {{TOKEN}} por el valor original. */
    public readonly hydrate: boolean = false,
  ) {}
}
