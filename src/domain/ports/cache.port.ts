/**
 * PUERTO driven.
 *
 * CAPA: Domain  |  IMPLEMENTA: infrastructure/cache/*  (hoy: Map en RAM)
 *
 * FLUJO:
 *   UseCase hashea tenant + prompt masked
 *     → cache.get(key)  si hay hit, NO se llama al LLM
 *     → cache.set(key, respuesta) después de un miss
 *
 * Se cachea el texto ENMASCARADO, nunca el original.
 */
export interface CachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec: number): Promise<void>;
}
