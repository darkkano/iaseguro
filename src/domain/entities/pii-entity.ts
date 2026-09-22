/**
 * CAPA: Domain / Entidad
 * QUÉ: un dato sensible encontrado en el prompt, ya tokenizado.
 *
 * FLUJO:
 *   nace en SanitizerPort.mask()  (adapter regex, infra)
 *   viaja dentro de MaskedPrompt  (dominio)
 *   se usa al final para rehidratar SI el cliente pidió hydrate=true
 *
 * `original` NUNCA se manda al LLM ni al audit log.
 */
export type PiiType = 'CARD' | 'EMAIL' | 'PHONE' | 'NAME' | 'ID' | 'SECRET';

export class PiiEntity {
  constructor(
    /** Placeholder que SÍ puede ver el modelo. Ej: {{CARD_1}} */
    public readonly token: string,
    public readonly type: PiiType,
    /** Valor real. Solo vive en memoria del request / mapa temporal. */
    public readonly original: string,
  ) {}
}
