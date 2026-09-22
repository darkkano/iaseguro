import { CompletionRequest } from '../../domain/entities/completion-request.js';
import { CompletionResult } from '../../domain/entities/completion-result.js';
import type { AuditPort } from '../../domain/ports/audit.port.js';
import type { BudgetPort } from '../../domain/ports/budget.port.js';
import type { CachePort } from '../../domain/ports/cache.port.js';
import type { ClassifierPort } from '../../domain/ports/classifier.port.js';
import type { LlmProviderPort } from '../../domain/ports/llm-provider.port.js';
import type { SanitizerPort } from '../../domain/ports/sanitizer.port.js';
export declare class CompletePromptUseCase {
    private readonly sanitizer;
    private readonly classifier;
    private readonly llm;
    private readonly cache;
    private readonly budget;
    private readonly audit;
    private readonly logger;
    constructor(sanitizer: SanitizerPort, classifier: ClassifierPort, llm: LlmProviderPort, cache: CachePort, budget: BudgetPort, audit: AuditPort);
    execute(input: CompletionRequest): Promise<CompletionResult>;
}
