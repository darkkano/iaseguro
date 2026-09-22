import { MaskedPrompt } from '../entities/masked-prompt.js';

/**
 * PUERTO (lado driven / salida) — como IProductRepository en el CRUD.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/sanitizer/*
 *
 * FLUJO:
 *   UseCase  --llama a-->  SanitizerPort.mask(prompt crudo)
 *                      ←-- MaskedPrompt (texto con {{TOKENS}})
 *
 * El dominio no sabe si detrás hay regex, Presidio o un microservicio Python.
 */
export interface SanitizerPort {
  mask(prompt: string): MaskedPrompt;
}
