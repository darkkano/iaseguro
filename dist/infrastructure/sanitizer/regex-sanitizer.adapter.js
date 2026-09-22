var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { MaskedPrompt } from '../../domain/entities/masked-prompt.js';
import { PiiEntity } from '../../domain/entities/pii-entity.js';
import { BlockedPiiError } from '../../domain/errors/blocked-pii.error.js';
let RegexSanitizerAdapter = class RegexSanitizerAdapter {
    mask(prompt) {
        CARD_RE.lastIndex = 0;
        EMAIL_RE.lastIndex = 0;
        PHONE_RE.lastIndex = 0;
        ID_RE.lastIndex = 0;
        NAME_RE.lastIndex = 0;
        if (SECRET_RE.test(prompt)) {
            throw new BlockedPiiError('SECRET');
        }
        const entities = [];
        const counters = {
            CARD: 0,
            EMAIL: 0,
            PHONE: 0,
            NAME: 0,
            ID: 0,
            SECRET: 0,
        };
        let text = prompt;
        text = replaceAll(text, CARD_RE, (match) => {
            if (!isLuhn(match))
                return match;
            return token('CARD', match, counters, entities);
        });
        text = replaceAll(text, EMAIL_RE, (match) => token('EMAIL', match, counters, entities));
        text = replaceAll(text, PHONE_RE, (match) => token('PHONE', match, counters, entities));
        text = replaceAll(text, ID_RE, (match) => token('ID', match, counters, entities));
        text = replaceAll(text, NAME_RE, (match) => token('NAME', match, counters, entities));
        return new MaskedPrompt(text, entities);
    }
};
RegexSanitizerAdapter = __decorate([
    Injectable()
], RegexSanitizerAdapter);
export { RegexSanitizerAdapter };
function token(type, original, counters, entities) {
    counters[type] += 1;
    const placeholder = `{{${type}_${counters[type]}}}`;
    entities.push(new PiiEntity(placeholder, type, original));
    return placeholder;
}
function replaceAll(input, regex, replacer) {
    return input.replace(regex, (m) => replacer(m));
}
const SECRET_RE = /\bsk-[A-Za-z0-9]{8,}\b|\bAKIA[0-9A-Z]{8,}\b/;
const CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PHONE_RE = /\b(?:\+58|0)(?:4\d{2}|2\d{2})[\s-]?\d{3}[\s-]?\d{4}\b|\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/g;
const ID_RE = /\b[VEJPG]-?\d{6,9}\b/gi;
const NAME_RE = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,} [A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}\b/g;
function isLuhn(raw) {
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19)
        return false;
    let sum = 0;
    let doubleIt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = Number(digits[i]);
        if (doubleIt) {
            n *= 2;
            if (n > 9)
                n -= 9;
        }
        sum += n;
        doubleIt = !doubleIt;
    }
    return sum % 10 === 0;
}
//# sourceMappingURL=regex-sanitizer.adapter.js.map