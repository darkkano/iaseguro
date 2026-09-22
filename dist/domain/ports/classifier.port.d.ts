export interface ClassifierPort {
    score(maskedPrompt: string): number;
}
