import { Injectable } from '@nestjs/common';
import type { ClassifierPort } from '../../domain/ports/classifier.port.js';

/**
 * ADAPTER driven
 * IMPLEMENTA: ClassifierPort
 *
 * FLUJO:
 *   UseCase pasa el prompt MASKED (sin PII)
 *     → este heurístico (gratis, síncrono)
 *     → número
 *   UseCase llama decideModel(score) en domain/routing-policy.ts
 *
 * Ejemplos de práctica:
 *   "Resume este texto: hola"                         → 0  → llama3
 *   "Compara NestJS con Laravel"                       → 3  → gpt-4o-mini
 *   "Analiza esta arquitectura y propone un refactor"  → 5  → gpt-4o
 */
@Injectable()
export class HeuristicClassifierAdapter implements ClassifierPort {
  score(maskedPrompt: string): number {
    let score = 0;
    const p = maskedPrompt;

    if (/analiza|arquitectura|refactor|demuestra|diseña un sistema/i.test(p)) {
      score += 5;
    } else if (/compara|explica por qu[eé]|explica las ventajas/i.test(p)) {
      score += 3;
    }

    if (p.length > 500) score += 2;
    if (/```/.test(p)) score += 2;
    if ((p.match(/\?/g) ?? []).length > 2) score += 1;

    return score;
  }
}
