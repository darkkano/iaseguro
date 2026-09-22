import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditEntry } from '../../domain/entities/audit-entry.js';
import { CompletionRequest } from '../../domain/entities/completion-request.js';
import { CompletionResult } from '../../domain/entities/completion-result.js';
import { BudgetExceededError } from '../../domain/errors/budget-exceeded.error.js';
import type { AuditPort } from '../../domain/ports/audit.port.js';
import type { BudgetPort } from '../../domain/ports/budget.port.js';
import type { CachePort } from '../../domain/ports/cache.port.js';
import type { ClassifierPort } from '../../domain/ports/classifier.port.js';
import type { LlmProviderPort } from '../../domain/ports/llm-provider.port.js';
import type { SanitizerPort } from '../../domain/ports/sanitizer.port.js';
import {
  AUDIT,
  BUDGET,
  CACHE,
  CLASSIFIER,
  LLM_PROVIDER,
  SANITIZER,
} from '../../domain/ports/tokens.js';
import type { ModelName } from '../../domain/entities/routing-decision.js';
import { decideModel, estimateCost } from '../../domain/routing-policy.js';

/** Lo que guardamos en cache: respuesta + metadatos de enrutado. */
interface CachedPayload {
  text: string;
  model: ModelName;
  score: number;
  reason: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * CAPA: Application (verde del hexágono)
 * ROL:  único caso de uso de esta práctica = "completar un prompt con seguridad y costo"
 *
 * EQUIVALE a CreateProductUseCase del CRUD de productos.
 *
 * FLUJO que orquesta (de dónde → hacia dónde):
 *
 *   ① HTTP ya ocurrió (controller)
 *   ② Controller nos pasa CompletionRequest
 *   ③ Este execute() habla SOLO con PUERTOS (interfaces)
 *   ④ Los adapters (naranja) cumplen esos puertos: regex, Redis/Map, LLM falso
 *
 * ALGORITMO — 8 pasos (el orden importa):
 *   1. Enmascarar PII          → el LLM jamás ve el original
 *   2. Cache por hash masked   → ahorra dinero si el prompt se repite
 *   3. Clasificar complejidad  → número
 *   4. Decidir modelo          → regla PURA de dominio
 *   5. Chequear presupuesto    → o BudgetExceededError
 *   6. Llamar LLM              → prompt masked
 *   7. Cobrar + cache + audit
 *   8. Rehidratar opcional     → solo si hydrate=true
 */
@Injectable()
export class CompletePromptUseCase {
  private readonly logger = new Logger(CompletePromptUseCase.name);

  constructor(
    @Inject(SANITIZER) private readonly sanitizer: SanitizerPort,
    @Inject(CLASSIFIER) private readonly classifier: ClassifierPort,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProviderPort,
    @Inject(CACHE) private readonly cache: CachePort,
    @Inject(BUDGET) private readonly budget: BudgetPort,
    @Inject(AUDIT) private readonly audit: AuditPort,
  ) {}

  async execute(input: CompletionRequest): Promise<CompletionResult> {
    // ── 1. SANITIZAR (infra regex, contrato de dominio) ──────────────
    this.logger.log(`[1] Sanitizar prompt del tenant=${input.tenantId}`);
    const masked = this.sanitizer.mask(input.prompt);
    this.logger.log(
      `[1] Prompt masked="${masked.text}" redactions=${masked.redactionTypes().join(',') || 'ninguna'}`,
    );

    // ── 2. CACHE (clave = tenant + texto YA seguro) ──────────────────
    const cacheKey = hashKey(input.tenantId, masked.text);
    const cachedRaw = await this.cache.get(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as CachedPayload;
      this.logger.log(`[2] Cache HIT key=${cacheKey.slice(0, 8)}… no se llama al LLM`);
      const status = await this.budget.getStatus(input.tenantId);
      await this.audit.log(
        new AuditEntry(
          new Date().toISOString(),
          input.tenantId,
          masked.text,
          cached.model,
          true,
          0,
        ),
      );
      return new CompletionResult(
        input.hydrate ? masked.hydrate(cached.text) : cached.text,
        cached.model,
        cached.score,
        `Cache hit. Enrutado original: ${cached.reason}`,
        true,
        cached.inputTokens,
        cached.outputTokens,
        0,
        masked.redactionTypes(),
        status.remainingUsd,
        cached.text,
      );
    }
    this.logger.log(`[2] Cache MISS`);

    // ── 3. CLASIFICAR ────────────────────────────────────────────────
    const score = this.classifier.score(masked.text);
    this.logger.log(`[3] Score de complejidad=${score}`);

    // ── 4. DECIDIR MODELO (dominio puro, cero I/O) ───────────────────
    const route = decideModel(score);
    const estimated = estimateCost(route.model);
    this.logger.log(
      `[4] Modelo=${route.model} motivo="${route.reason}" costoEstimado=${estimated}`,
    );

    // ── 5. PRESUPUESTO ───────────────────────────────────────────────
    const allowed = await this.budget.canSpend(input.tenantId, estimated);
    if (!allowed) {
      this.logger.warn(`[5] Presupuesto insuficiente → abortar`);
      throw new BudgetExceededError(input.tenantId, route.model);
    }
    this.logger.log(`[5] Presupuesto OK`);

    // ── 6. LLM (solo texto masked) ───────────────────────────────────
    this.logger.log(`[6] Llamar LLM provider con prompt masked`);
    const raw = await this.llm.complete({
      model: route.model,
      prompt: masked.text,
    });

    // ── 7. COBRAR + GUARDAR CACHE + AUDIT ────────────────────────────
    await this.budget.addSpend(input.tenantId, estimated);
    const payload: CachedPayload = {
      text: raw.text,
      model: route.model,
      score,
      reason: route.reason,
      inputTokens: raw.inputTokens,
      outputTokens: raw.outputTokens,
    };
    await this.cache.set(cacheKey, JSON.stringify(payload), 3600);
    await this.audit.log(
      new AuditEntry(
        new Date().toISOString(),
        input.tenantId,
        masked.text,
        route.model,
        false,
        estimated,
      ),
    );
    const status = await this.budget.getStatus(input.tenantId);
    this.logger.log(
      `[7] Cobrado=${estimated} restante=${status.remainingUsd} cache SET`,
    );

    // ── 8. REHIDRATAR (opcional, ya FUERA del LLM) ───────────────────
    const text = input.hydrate ? masked.hydrate(raw.text) : raw.text;
    this.logger.log(`[8] hydrate=${input.hydrate} → devolver al controller`);

    return new CompletionResult(
      text,
      route.model,
      score,
      route.reason,
      false,
      raw.inputTokens,
      raw.outputTokens,
      estimated,
      masked.redactionTypes(),
      status.remainingUsd,
      raw.text,
    );
  }
}

function hashKey(tenantId: string, maskedPrompt: string): string {
  return createHash('sha256')
    .update(`${tenantId}:${maskedPrompt}`)
    .digest('hex');
}
