import { MaskedPrompt } from '../../domain/entities/masked-prompt.js';
import type { SanitizerPort } from '../../domain/ports/sanitizer.port.js';
export declare class RegexSanitizerAdapter implements SanitizerPort {
    mask(prompt: string): MaskedPrompt;
}
