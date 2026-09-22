import { RegexSanitizerAdapter } from './regex-sanitizer.adapter.js';
import { BlockedPiiError } from '../../domain/errors/blocked-pii.error.js';

describe('RegexSanitizerAdapter', () => {
  const sanitizer = new RegexSanitizerAdapter();

  it('enmascara una tarjeta Luhn válida', () => {
    const masked = sanitizer.mask('pagó con 4111111111111111 ayer');
    expect(masked.text).toContain('{{CARD_1}}');
    expect(masked.text).not.toContain('4111111111111111');
    expect(masked.entities[0].type).toBe('CARD');
  });

  it('enmascara email y nombre', () => {
    const masked = sanitizer.mask('Escribe a Ana Pérez, email ana@acme.com');
    expect(masked.text).toContain('{{EMAIL_1}}');
    expect(masked.text).toContain('{{NAME_1}}');
    expect(masked.hydrate('Hola {{NAME_1}} ({{EMAIL_1}})')).toBe(
      'Hola Ana Pérez (ana@acme.com)',
    );
  });

  it('bloquea API keys en vez de tokenizarlas', () => {
    expect(() => sanitizer.mask('usa sk-abcdefghij')).toThrow(BlockedPiiError);
  });
});
