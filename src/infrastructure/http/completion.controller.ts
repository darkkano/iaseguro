import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CompletePromptUseCase } from '../../application/use-cases/complete-prompt.use-case.js';
import { CompletionRequest } from '../../domain/entities/completion-request.js';
import type { CompletePromptBody } from './complete-prompt.body.js';

/**
 * ADAPTER driving (naranja IZQUIERDA del hexágono)
 * Equivale al "Controller HTTP (NestJS)" del diagrama de Products.
 *
 * FLUJO:
 *   ① Cliente POST /v1/completions
 *   ② Este controller arma CompletionRequest y DELEGA al use case
 *      (no sanitiza, no elige modelo, no habla con Redis)
 *   ←  JSON con CompletionResult
 */
@Controller('v1/completions')
export class CompletionController {
  constructor(private readonly completePrompt: CompletePromptUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async complete(
    @Body() body: CompletePromptBody,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    if (!body?.prompt || typeof body.prompt !== 'string') {
      throw new BadRequestException('El campo "prompt" (string) es obligatorio.');
    }

    const tenantId = tenantHeader?.trim() || 'demo';

    const result = await this.completePrompt.execute(
      new CompletionRequest(tenantId, body.prompt, Boolean(body.hydrate)),
    );

    return {
      /** Si hydrate=true trae valores reales; si no, queda con {{TOKENS}}. */
      output: result.text,
      /** Siempre el texto que vio/produjo el LLM (enmascarado). Compara con `output`. */
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
}

/**
 * Mapa rápido del proyecto. GET /
 * No es lógica de negocio: solo orientación para la práctica.
 */
@Controller()
export class HealthController {
  @Get()
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
}
