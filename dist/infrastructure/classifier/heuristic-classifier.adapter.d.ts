import type { ClassifierPort } from '../../domain/ports/classifier.port.js';
export declare class HeuristicClassifierAdapter implements ClassifierPort {
    score(maskedPrompt: string): number;
}
