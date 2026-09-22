import { PiiEntity } from './pii-entity.js';
export declare class MaskedPrompt {
    readonly text: string;
    readonly entities: PiiEntity[];
    constructor(text: string, entities: PiiEntity[]);
    hydrate(answer: string): string;
    redactionTypes(): string[];
}
