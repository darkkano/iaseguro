import { PiiEntity } from './pii-entity.js';

/**
 * CAPA: Domain / Entidad
 * QUÉ: el prompt ya seguro para salir hacia un LLM + el mapa de tokens.
 *
 * FLUJO:
 *   SanitizerPort.mask(prompt crudo)  →  MaskedPrompt
 *   UseCase manda `.text` al LLM / cache / audit
 *   UseCase usa `.hydrate(respuesta)` solo al devolver al cliente
 */
export class MaskedPrompt {
  constructor(
    public readonly text: string,
    public readonly entities: PiiEntity[],
  ) {}

  /**
   * Reemplaza {{TYPE_N}} por el valor original.
   * Si el modelo inventa un token que no existe en `entities`, se deja tal cual.
   */
  hydrate(answer: string): string {
    let out = answer;
    for (const entity of this.entities) {
      out = out.split(entity.token).join(entity.original);
    }
    return out;
  }

  /** Tipos detectados, sin valores. Sirve para la respuesta HTTP y el audit. */
  redactionTypes(): string[] {
    return [...new Set(this.entities.map((e) => e.type))];
  }
}
