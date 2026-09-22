var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CompletePromptUseCase_1;
import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditEntry } from '../../domain/entities/audit-entry.js';
import { CompletionResult } from '../../domain/entities/completion-result.js';
import { BudgetExceededError } from '../../domain/errors/budget-exceeded.error.js';
import { AUDIT, BUDGET, CACHE, CLASSIFIER, LLM_PROVIDER, SANITIZER, } from '../../domain/ports/tokens.js';
import { decideModel, estimateCost } from '../../domain/routing-policy.js';
let CompletePromptUseCase = CompletePromptUseCase_1 = class CompletePromptUseCase {
    sanitizer;
    classifier;
    llm;
    cache;
    budget;
    audit;
    logger = new Logger(CompletePromptUseCase_1.name);
    constructor(sanitizer, classifier, llm, cache, budget, audit) {
        this.sanitizer = sanitizer;
        this.classifier = classifier;
        this.llm = llm;
        this.cache = cache;
        this.budget = budget;
        this.audit = audit;
    }
    async execute(input) {
        this.logger.log(`[1] Sanitizar prompt del tenant=${input.tenantId}`);
        const masked = this.sanitizer.mask(input.prompt);
        this.logger.log(`[1] Prompt masked="${masked.text}" redactions=${masked.redactionTypes().join(',') || 'ninguna'}`);
        const cacheKey = hashKey(input.tenantId, masked.text);
        const cachedRaw = await this.cache.get(cacheKey);
        if (cachedRaw) {
            const cached = JSON.parse(cachedRaw);
            this.logger.log(`[2] Cache HIT key=${cacheKey.slice(0, 8)}… no se llama al LLM`);
            const status = await this.budget.getStatus(input.tenantId);
            await this.audit.log(new AuditEntry(new Date().toISOString(), input.tenantId, masked.text, cached.model, true, 0));
            return new CompletionResult(input.hydrate ? masked.hydrate(cached.text) : cached.text, cached.model, cached.score, `Cache hit. Enrutado original: ${cached.reason}`, true, cached.inputTokens, cached.outputTokens, 0, masked.redactionTypes(), status.remainingUsd, cached.text);
        }
        this.logger.log(`[2] Cache MISS`);
        const score = this.classifier.score(masked.text);
        this.logger.log(`[3] Score de complejidad=${score}`);
        const route = decideModel(score);
        const estimated = estimateCost(route.model);
        this.logger.log(`[4] Modelo=${route.model} motivo="${route.reason}" costoEstimado=${estimated}`);
        const allowed = await this.budget.canSpend(input.tenantId, estimated);
        if (!allowed) {
            this.logger.warn(`[5] Presupuesto insuficiente → abortar`);
            throw new BudgetExceededError(input.tenantId, route.model);
        }
        this.logger.log(`[5] Presupuesto OK`);
        this.logger.log(`[6] Llamar LLM provider con prompt masked`);
        const raw = await this.llm.complete({
            model: route.model,
            prompt: masked.text,
        });
        await this.budget.addSpend(input.tenantId, estimated);
        const payload = {
            text: raw.text,
            model: route.model,
            score,
            reason: route.reason,
            inputTokens: raw.inputTokens,
            outputTokens: raw.outputTokens,
        };
        await this.cache.set(cacheKey, JSON.stringify(payload), 3600);
        await this.audit.log(new AuditEntry(new Date().toISOString(), input.tenantId, masked.text, route.model, false, estimated));
        const status = await this.budget.getStatus(input.tenantId);
        this.logger.log(`[7] Cobrado=${estimated} restante=${status.remainingUsd} cache SET`);
        const text = input.hydrate ? masked.hydrate(raw.text) : raw.text;
        this.logger.log(`[8] hydrate=${input.hydrate} → devolver al controller`);
        return new CompletionResult(text, route.model, score, route.reason, false, raw.inputTokens, raw.outputTokens, estimated, masked.redactionTypes(), status.remainingUsd, raw.text);
    }
};
CompletePromptUseCase = CompletePromptUseCase_1 = __decorate([
    Injectable(),
    __param(0, Inject(SANITIZER)),
    __param(1, Inject(CLASSIFIER)),
    __param(2, Inject(LLM_PROVIDER)),
    __param(3, Inject(CACHE)),
    __param(4, Inject(BUDGET)),
    __param(5, Inject(AUDIT)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], CompletePromptUseCase);
export { CompletePromptUseCase };
function hashKey(tenantId, maskedPrompt) {
    return createHash('sha256')
        .update(`${tenantId}:${maskedPrompt}`)
        .digest('hex');
}
//# sourceMappingURL=complete-prompt.use-case.js.map