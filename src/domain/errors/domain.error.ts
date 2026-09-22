/**
 * CAPA: Domain (núcleo azul)
 * ROL:  Error base de negocio
 *
 * FLUJO:
 *   UseCase lanza un DomainError
 *     → DomainExceptionFilter (infrastructure/http)
 *       → HTTP 4xx
 *
 * El dominio NO conoce status codes. HTTP es un detalle de infraestructura.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
