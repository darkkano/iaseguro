/**
 * CAPA: Domain / tokens de inyección
 *
 * FLUJO (flecha de "enchufe" en AppModule):
 *   { provide: SANITIZER, useClass: RegexSanitizerAdapter }
 *     → CompletePromptUseCase pide @Inject(SANITIZER)
 *
 * El use case depende del SÍMBOLO, no de la clase concreta.
 * Por eso puedes cambiar Regex → Presidio sin tocar el caso de uso.
 */
export const SANITIZER = Symbol('SANITIZER');
export const CLASSIFIER = Symbol('CLASSIFIER');
export const LLM_PROVIDER = Symbol('LLM_PROVIDER');
export const CACHE = Symbol('CACHE');
export const BUDGET = Symbol('BUDGET');
export const AUDIT = Symbol('AUDIT');
