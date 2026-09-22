import { CompletePromptUseCase } from './complete-prompt.use-case.js';
import { CompletionRequest } from '../../domain/entities/completion-request.js';
import { MaskedPrompt } from '../../domain/entities/masked-prompt.js';
import { PiiEntity } from '../../domain/entities/pii-entity.js';
import { BudgetExceededError } from '../../domain/errors/budget-exceeded.error.js';
import { BlockedPiiError } from '../../domain/errors/blocked-pii.error.js';
import type { SanitizerPort } from '../../domain/ports/sanitizer.port.js';
import type { ClassifierPort } from '../../domain/ports/classifier.port.js';
import type { LlmProviderPort } from '../../domain/ports/llm-provider.port.js';
import type { CachePort } from '../../domain/ports/cache.port.js';
import type { BudgetPort } from '../../domain/ports/budget.port.js';
import type { AuditPort } from '../../domain/ports/audit.port.js';

/**
 * Test de hexagonal: el caso de uso se prueba con PUERTOS FALSOS.
 * No hay Nest HTTP, no hay Redis, no hay OpenAI.
 * Si este test pasa, el núcleo está desacoplado de la infraestructura.
 */
function build(overrides: {
  sanitizer?: Partial<SanitizerPort>;
  classifier?: Partial<ClassifierPort>;
  llm?: Partial<LlmProviderPort>;
  cache?: Partial<CachePort>;
  budget?: Partial<BudgetPort>;
  audit?: Partial<AuditPort>;
} = {}) {
  const sanitizer: SanitizerPort = {
    mask: (prompt) =>
      new MaskedPrompt(prompt.replace('4111111111111111', '{{CARD_1}}'), [
        new PiiEntity('{{CARD_1}}', 'CARD', '4111111111111111'),
      ]),
    ...overrides.sanitizer,
  };

  const classifier: ClassifierPort = {
    score: () => 0,
    ...overrides.classifier,
  };

  const complete = vi.fn(async ({ prompt }) => ({
    text: `eco:${prompt}`,
    inputTokens: 10,
    outputTokens: 5,
  }));

  const llm: LlmProviderPort = {
    complete,
    ...overrides.llm,
  };

  const cache: CachePort = {
    get: async () => null,
    set: async () => undefined,
    ...overrides.cache,
  };

  const budget: BudgetPort = {
    canSpend: async () => true,
    addSpend: async () => undefined,
    getStatus: async () => ({ spentUsd: 0, limitUsd: 1, remainingUsd: 1 }),
    ...overrides.budget,
  };

  const audit: AuditPort = {
    log: async () => undefined,
    list: async () => [],
    ...overrides.audit,
  };

  const useCase = new CompletePromptUseCase(
    sanitizer,
    classifier,
    llm,
    cache,
    budget,
    audit,
  );

  return { useCase, complete };
}

describe('CompletePromptUseCase (núcleo hexagonal)', () => {
  it('manda al LLM el prompt ENMASCARADO, nunca la tarjeta real', async () => {
    const { useCase, complete } = build();

    await useCase.execute(
      new CompletionRequest('t1', 'pago con 4111111111111111', false),
    );

    expect(complete).toHaveBeenCalledWith({
      model: 'llama3',
      prompt: 'pago con {{CARD_1}}',
    });
  });

  it('rehidrata la respuesta si hydrate=true', async () => {
    const { useCase } = build();

    const result = await useCase.execute(
      new CompletionRequest('t1', 'pago con 4111111111111111', true),
    );

    expect(result.text).toContain('4111111111111111');
    expect(result.redactions).toContain('CARD');
  });

  it('enruta a gpt-4o cuando el score es alto', async () => {
    const { useCase, complete } = build({
      classifier: { score: () => 7 },
    });

    const result = await useCase.execute(new CompletionRequest('t1', 'hola'));

    expect(result.model).toBe('gpt-4o');
    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gpt-4o' }),
    );
  });

  it('NO llama al LLM si hay cache hit', async () => {
    const { useCase, complete } = build({
      cache: {
        get: async () =>
          JSON.stringify({
            text: 'desde-cache',
            model: 'llama3',
            score: 0,
            reason: 'test',
            inputTokens: 0,
            outputTokens: 0,
          }),
      },
    });

    const result = await useCase.execute(new CompletionRequest('t1', 'hola'));

    expect(result.fromCache).toBe(true);
    expect(result.text).toBe('desde-cache');
    expect(complete).not.toHaveBeenCalled();
  });

  it('lanza BudgetExceededError si no hay saldo (sin llamar LLM)', async () => {
    const { useCase, complete } = build({
      budget: {
        canSpend: async () => false,
        addSpend: async () => undefined,
        getStatus: async () => ({ spentUsd: 1, limitUsd: 1, remainingUsd: 0 }),
      },
    });

    await expect(
      useCase.execute(new CompletionRequest('t1', 'hola')),
    ).rejects.toBeInstanceOf(BudgetExceededError);
    expect(complete).not.toHaveBeenCalled();
  });

  it('propaga BlockedPiiError del sanitizer y no llama al LLM', async () => {
    const { useCase, complete } = build({
      sanitizer: {
        mask: () => {
          throw new BlockedPiiError('SECRET');
        },
      },
    });

    await expect(
      useCase.execute(new CompletionRequest('t1', 'clave-bloqueada')),
    ).rejects.toBeInstanceOf(BlockedPiiError);
    expect(complete).not.toHaveBeenCalled();
  });
});
