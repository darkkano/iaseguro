export class MaskedPrompt {
    text;
    entities;
    constructor(text, entities) {
        this.text = text;
        this.entities = entities;
    }
    hydrate(answer) {
        let out = answer;
        for (const entity of this.entities) {
            out = out.split(entity.token).join(entity.original);
        }
        return out;
    }
    redactionTypes() {
        return [...new Set(this.entities.map((e) => e.type))];
    }
}
//# sourceMappingURL=masked-prompt.js.map