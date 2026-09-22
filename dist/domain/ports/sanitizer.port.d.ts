import { MaskedPrompt } from '../entities/masked-prompt.js';
export interface SanitizerPort {
    mask(prompt: string): MaskedPrompt;
}
