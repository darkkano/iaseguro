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
import { BadRequestException, Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, } from '@nestjs/common';
import { CompletePromptUseCase } from '../../application/use-cases/complete-prompt.use-case.js';
import { CompletionRequest } from '../../domain/entities/completion-request.js';
let CompletionController = class CompletionController {
    completePrompt;
    constructor(completePrompt) {
        this.completePrompt = completePrompt;
    }
    async complete(body, tenantHeader) {
        if (!body?.prompt || typeof body.prompt !== 'string') {
            throw new BadRequestException('El campo "prompt" (string) es obligatorio.');
        }
        const tenantId = tenantHeader?.trim() || 'demo';
        const result = await this.completePrompt.execute(new CompletionRequest(tenantId, body.prompt, Boolean(body.hydrate)));
        return {
            output: result.text,
            outputMasked: result.maskedText,
            modelUsed: result.model,
            complexityScore: result.score,
            reason: result.reason,
            fromCache: result.fromCache,
            redactions: result.redactions,
            usage: {
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
                usd: result.usd,
            },
            budgetRemainingUsd: result.budgetRemainingUsd,
        };
    }
};
__decorate([
    Post(),
    HttpCode(HttpStatus.OK),
    __param(0, Body()),
    __param(1, Headers('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompletionController.prototype, "complete", null);
CompletionController = __decorate([
    Controller('v1/completions'),
    __metadata("design:paramtypes", [CompletePromptUseCase])
], CompletionController);
export { CompletionController };
let HealthController = class HealthController {
    info() {
        return {
            name: 'Gateway de IA Seguro (práctica hexagonal)',
            idea: 'Sanitizar PII en local y enrutar a Llama 3 / GPT-4 según complejidad.',
            flujo: [
                '1 HTTP → CompletionController',
                '2 Controller → CompletePromptUseCase',
                '3 UseCase → puertos (sanitizer, classifier, llm, cache, budget, audit)',
                '4 Adapters → regex / Map en RAM / LLM simulado',
            ],
            endpoints: {
                'POST /v1/completions': 'Caso de uso principal',
                'GET /v1/budget': 'Saldo del tenant (header x-tenant-id)',
                'GET /v1/audit': 'Logs enmascarados del tenant',
            },
            lee: 'README.md',
        };
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "info", null);
HealthController = __decorate([
    Controller()
], HealthController);
export { HealthController };
//# sourceMappingURL=completion.controller.js.map