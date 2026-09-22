export class CompletionResult {
    text;
    model;
    score;
    reason;
    fromCache;
    inputTokens;
    outputTokens;
    usd;
    redactions;
    budgetRemainingUsd;
    maskedText;
    constructor(text, model, score, reason, fromCache, inputTokens, outputTokens, usd, redactions, budgetRemainingUsd, maskedText) {
        this.text = text;
        this.model = model;
        this.score = score;
        this.reason = reason;
        this.fromCache = fromCache;
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
        this.usd = usd;
        this.redactions = redactions;
        this.budgetRemainingUsd = budgetRemainingUsd;
        this.maskedText = maskedText;
    }
}
//# sourceMappingURL=completion-result.js.map