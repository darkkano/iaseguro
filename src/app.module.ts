import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CompletePromptUseCase } from './application/use-cases/complete-prompt.use-case.js';
import {
  AUDIT,
  BUDGET,
  CACHE,
  CLASSIFIER,
  LLM_PROVIDER,
  SANITIZER,
} from './domain/ports/tokens.js';
import { InMemoryAuditAdapter } from './infrastructure/audit/in-memory-audit.adapter.js';
import { InMemoryBudgetAdapter } from './infrastructure/budget/in-memory-budget.adapter.js';
import { InMemoryCacheAdapter } from './infrastructure/cache/in-memory-cache.adapter.js';
import { HeuristicClassifierAdapter } from './infrastructure/classifier/heuristic-classifier.adapter.js';
import {
  CompletionController,
  HealthController,
} from './infrastructure/http/completion.controller.js';
import { DebugController } from './infrastructure/http/debug.controller.js';
import { DomainExceptionFilter } from './infrastructure/http/domain-exception.filter.js';
import { LlamaAdapter } from './infrastructure/llm/llama.adapter.js';
import { LlmRouterAdapter } from './infrastructure/llm/llm-router.adapter.js';
import { OpenAiAdapter } from './infrastructure/llm/openai.adapter.js';
import { RegexSanitizerAdapter } from './infrastructure/sanitizer/regex-sanitizer.adapter.js';

/**
 * ENCHUFE del hexágono (única zona que conoce Domain + Infra juntos).
 *
 *   controllers  = adapters de ENTRADA (driving)
 *   useCase      = application
 *   provide:TOKEN + useClass:Adapter = adapters de SALIDA (driven)
 *
 * Para pasar de RAM → Redis, solo cambias useClass aquí.
 */
@Module({
  controllers: [HealthController, CompletionController, DebugController],
  providers: [
    CompletePromptUseCase,
    LlamaAdapter,
    OpenAiAdapter,
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    { provide: SANITIZER, useClass: RegexSanitizerAdapter },
    { provide: CLASSIFIER, useClass: HeuristicClassifierAdapter },
    { provide: LLM_PROVIDER, useClass: LlmRouterAdapter },
    { provide: CACHE, useClass: InMemoryCacheAdapter },
    { provide: BUDGET, useClass: InMemoryBudgetAdapter },
    { provide: AUDIT, useClass: InMemoryAuditAdapter },
  ],
})
export class AppModule {}
