import { Injectable } from '@nestjs/common';
import { MaskedPrompt } from '../../domain/entities/masked-prompt.js';
import { PiiEntity, PiiType } from '../../domain/entities/pii-entity.js';
import { BlockedPiiError } from '../../domain/errors/blocked-pii.error.js';
import type { SanitizerPort } from '../../domain/ports/sanitizer.port.js';

/**
 * ADAPTER driven (naranja derecha del hexágono)
 * IMPLEMENTA: SanitizerPort
 *
 * FLUJO:
 *   UseCase.sanitizer.mask(prompt)
 *     → este archivo (regex local, CERO red)
 *     → MaskedPrompt
 *
 * Mañana: cambia AppModule a PresidioSanitizerAdapter. El use case no se toca.
 *
 * Orden del algoritmo de enmascarado:
 *   0. SECRET  → se BLOQUEA (no se tokeniza)
 *   1. CARD    → Luhn
 *   2. EMAIL
 *   3. PHONE
 *   4. ID      → cédula/RIF estilo VE
 *   5. NAME    → dos palabras capitalizadas (heurística de práctica)
 */
@Injectable()
export class RegexSanitizerAdapter implements SanitizerPort {
  mask(prompt: string): MaskedPrompt {
    // Los regex /g guardan lastIndex a nivel módulo; se resetean por request.
    CARD_RE.lastIndex = 0;
    EMAIL_RE.lastIndex = 0;
    PHONE_RE.lastIndex = 0;
    ID_RE.lastIndex = 0;
    NAME_RE.lastIndex = 0;

    if (SECRET_RE.test(prompt)) {
      throw new BlockedPiiError('SECRET');
    }

    const entities: PiiEntity[] = [];
    const counters: Record<PiiType, number> = {
      CARD: 0,
      EMAIL: 0,
      PHONE: 0,
      NAME: 0,
      ID: 0,
      SECRET: 0,
    };

    let text = prompt;

    text = replaceAll(text, CARD_RE, (match) => {
      if (!isLuhn(match)) return match;
      return token('CARD', match, counters, entities);
    });

    text = replaceAll(text, EMAIL_RE, (match) =>
      token('EMAIL', match, counters, entities),
    );

    text = replaceAll(text, PHONE_RE, (match) =>
      token('PHONE', match, counters, entities),
    );

    text = replaceAll(text, ID_RE, (match) =>
      token('ID', match, counters, entities),
    );

    text = replaceAll(text, NAME_RE, (match) =>
      token('NAME', match, counters, entities),
    );

    return new MaskedPrompt(text, entities);
  }
}

function token(
  type: PiiType,
  original: string,
  counters: Record<PiiType, number>,
  entities: PiiEntity[],
): string {
  counters[type] += 1;
  const placeholder = `{{${type}_${counters[type]}}}`;
  entities.push(new PiiEntity(placeholder, type, original));
  return placeholder;
}

function replaceAll(
  input: string,
  regex: RegExp,
  replacer: (match: string) => string,
): string {
  return input.replace(regex, (m) => replacer(m));
}

/** OpenAI-like keys, AWS access keys. No se envían ni tokenizadas. */
const SECRET_RE = /\bsk-[A-Za-z0-9]{8,}\b|\bAKIA[0-9A-Z]{8,}\b/;

/** 13–19 dígitos con separadores comunes. Se valida Luhn después. */
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/** +58..., 04xx-xxxxxxx, o 10+ dígitos con espacios. */
const PHONE_RE =
  /\b(?:\+58|0)(?:4\d{2}|2\d{2})[\s-]?\d{3}[\s-]?\d{4}\b|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/g;

const ID_RE = /\b[VEJPG]-?\d{6,9}\b/gi;

/**
 * Heurística de práctica, NO un NER real.
 * "Ana Pérez" sí; "NestJS" no (una sola palabra).
 */
const NAME_RE =
  /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,} [A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g;

function isLuhn(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleIt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (doubleIt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}
