# Gateway de IA Seguro — práctica hexagonal (NestJS)

```
HTTP  →  Controller  →  Use Case  →  Puertos  →  Adapters
```

---

## 1. Finalidad

Las empresas tienen **dos miedos** al usar IA:

1. **Privacidad.** Si mandas el prompt directo a ChatGPT, viajan nombres, tarjetas, cédulas y emails de clientes. Quedan en logs de un tercero.
2. **Dinero.** Si todo va a GPT-4, la factura se dispara. Un “resume esto” no necesita el modelo caro.

**Este proyecto es el portero en el medio.** Tu Angular/Laravel **no** llama a OpenAI. Llama a `POST /v1/completions`. El gateway:

| Hace | Para qué |
|------|----------|
| Enmascara PII en local (`{{CARD_1}}`, `{{EMAIL_1}}`) | el modelo nunca ve el dato real |
| Bloquea secretos (`sk-…`) | ni siquiera tokenizados salen |
| Elige Llama 3 / GPT-4o-mini / GPT-4o según complejidad | no pagas GPT-4 por un saludo |
| Corta si el tenant gastó $0.05 | presupuesto de práctica |
| Cachea el prompt ya masked | el mismo texto no se cobra dos veces |
| Audita solo texto enmascarado | puedes revisar qué se envió sin filtrar PII |

Hoy los LLM están **simulados** (no hay API key). La finalidad de código es **aprender hexagonal** con un caso que no es un CRUD: el “negocio” es transformar y enrutar un prompt, no persistir un producto.

**Qué no es:** un ChatGPT propio, ni un sistema de cumplimiento 100% GDPR. Es un ejercicio: el flujo real de un API Gateway de IA, con NestJS.

---

## 2. Cómo se usa — endpoints

```bash
npm install
npm run start:dev
```

Base: `http://localhost:3000`  
Header opcional en todos menos `GET /`: `x-tenant-id` (default `demo`).

| Método | Ruta | Qué hace |
|--------|------|----------|
| `GET` | `/` | Mapa del proyecto |
| `POST` | `/v1/completions` | Sanitiza, enruta modelo, simula LLM |
| `GET` | `/v1/budget` | Saldo del tenant |
| `GET` | `/v1/audit` | Logs enmascarados del tenant |

---

### `GET /`

Sin body. Lista idea + endpoints.

```bash
curl -s http://localhost:3000/
```

```json
{
  "name": "Gateway de IA Seguro (práctica hexagonal)",
  "endpoints": {
    "POST /v1/completions": "Caso de uso principal",
    "GET /v1/budget": "Saldo del tenant (header x-tenant-id)",
    "GET /v1/audit": "Logs enmascarados del tenant"
  }
}
```

---

### `POST /v1/completions`

El único caso de uso de negocio.

**Headers:** `Content-Type: application/json` · `x-tenant-id` opcional

**Body**

| Campo | Tipo | Obligatorio | Default | Qué hace |
|-------|------|-------------|---------|----------|
| `prompt` | string | sí | — | texto a procesar |
| `hydrate` | boolean | no | `false` | `true` = `output` trae PII real; el modelo igual solo vio `{{TOKEN}}` |

**200**

```json
{
  "output": "[llama3] ... Recibí SOLO texto enmascarado: Resume este texto: el gato duerme",
  "outputMasked": "[llama3] ... Recibí SOLO texto enmascarado: Resume este texto: el gato duerme",
  "modelUsed": "llama3",
  "complexityScore": 0,
  "reason": "Baja complejidad: saludo, resumen corto, formato.",
  "fromCache": false,
  "redactions": [],
  "usage": { "inputTokens": 9, "outputTokens": 24, "usd": 0.0001 },
  "budgetRemainingUsd": 0.0499
}
```

| Campo | Qué es |
|-------|--------|
| `output` | respuesta al cliente |
| `outputMasked` | lo que vio el modelo (`{{CARD_1}}`, `{{EMAIL_1}}`, …) |
| `modelUsed` | `llama3` · `gpt-4o-mini` · `gpt-4o` |
| `complexityScore` | 0–2 barato · 3–4 medio · ≥5 caro |
| `fromCache` | `true` = no se llamó al modelo, `usd` = 0 |
| `redactions` | tipos de PII tapados: `CARD`, `EMAIL`, `NAME`, `PHONE`, `ID` |
| `usage.usd` | costo simulado de este request |
| `budgetRemainingUsd` | saldo (tope **$0.05** / tenant) |

**Errores**

| HTTP | Body | Cuándo |
|------|------|--------|
| 400 | `{ "message": "El campo \"prompt\" (string) es obligatorio." }` | falta `prompt` |
| 402 | `{ "error": "BudgetExceededError", "message": "..." }` | saldo insuficiente |
| 422 | `{ "error": "BlockedPiiError", "message": "..." }` | secreto tipo `sk-` + 8 caracteres (se bloquea, no se enmascara) |

**Ejemplos**

Barato → `llama3`:

```bash
curl -s http://localhost:3000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Resume este texto: el gato duerme"}'
```

Medio → `gpt-4o-mini`:

```bash
curl -s http://localhost:3000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Compara NestJS con Laravel"}'
```

Caro + tarjeta → `gpt-4o`, `outputMasked` trae `{{CARD_1}}`:

```bash
curl -s http://localhost:3000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Analiza esta arquitectura. El cliente pago con 4111111111111111"}'
```

Hydrate → `output` con nombre/email, `outputMasked` con `{{NAME_1}}` / `{{EMAIL_1}}`:

```bash
curl -s http://localhost:3000/v1/completions \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Saluda a Ana Perez, email ana@acme.com","hydrate":true}'
```

Otro tenant:

```bash
curl -s http://localhost:3000/v1/completions \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: acme" \
  -d '{"prompt":"Resume este texto: hola"}'
```

El mismo `prompt` + mismo tenant otra vez → `"fromCache": true`.

---

### `GET /v1/budget`

Saldo del tenant (`x-tenant-id` o `demo`).

```bash
curl -s http://localhost:3000/v1/budget
curl -s http://localhost:3000/v1/budget -H "x-tenant-id: acme"
```

```json
{
  "spentUsd": 0.0122,
  "limitUsd": 0.05,
  "remainingUsd": 0.0378
}
```

---

### `GET /v1/audit`

Historial **enmascarado** del tenant. Nunca guarda la tarjeta/email reales.

```bash
curl -s http://localhost:3000/v1/audit
curl -s http://localhost:3000/v1/audit -H "x-tenant-id: acme"
```

```json
[
  {
    "at": "2026-09-16T20:31:50.131Z",
    "tenantId": "demo",
    "promptMasked": "Analiza esta arquitectura. El cliente pago con {{CARD_1}}",
    "model": "gpt-4o",
    "fromCache": false,
    "usd": 0.01
  }
]
```

Cache, budget y audit viven en RAM: al reiniciar `start:dev` se vacían.

---

## 3. Algoritmo del caso de uso

Todo vive en `src/application/use-cases/complete-prompt.use-case.ts`. Orden fijo:

| Paso | Qué hace | De dónde | Hacia dónde | Si falla |
|------|----------|----------|-------------|----------|
| **1. Sanitizar** | Regex + Luhn. Secretos → error | `prompt` crudo (HTTP) | `MaskedPrompt` | `BlockedPiiError` → 422 |
| **2. Cache** | `sha256(tenant + texto masked)` | `CachePort.get` | Si HIT, return (usd=0, sin LLM) | — |
| **3. Clasificar** | Heurística de complejidad | texto **ya masked** | `score: number` | — |
| **4. Enrutar** | `decideModel(score)` **función pura de dominio** | score | `llama3` / `gpt-4o-mini` / `gpt-4o` | — |
| **5. Presupuesto** | `spent + estimado <= 0.05` | `BudgetPort` | sigue o aborta | `BudgetExceededError` → 402 |
| **6. LLM** | Adapter simulado | **solo** `masked.text` | texto de respuesta | — |
| **7. Side-effects** | cobrar, cachear JSON, auditar masked | resultado LLM | RAM | — |
| **8. Rehidratar** | sustituye `{{TOKEN}}` si `hydrate: true` | respuesta + mapa PII | JSON al cliente | tokens inventados se dejan |

Regla de oro: **pasos 2, 6 y 7 nunca ven el prompt original.**

### Tabla de enrutado (`src/domain/routing-policy.ts`)

| Score | Modelo | Costo simulado | Cómo forzar el score |
|------|--------|----------------|----------------------|
| 0–2 | `llama3` | $0.0001 | `Resume este texto: …` |
| 3–4 | `gpt-4o-mini` | $0.002 | `Compara NestJS con Laravel` |
| ≥5 | `gpt-4o` | $0.01 | `Analiza esta arquitectura y propone un refactor` |

Límite de práctica: **$0.05 por tenant** (`InMemoryBudgetAdapter.LIMIT_USD`).

---

## 4. De dónde a dónde (hexágono)

```
                    ┌─────────────────────────────────┐
                    │ APPLICATION (verde)             │
                    │ CompletePromptUseCase           │
                    │     ▲ orquesta                  │
                    │     │ habla con interfaces      │
                    └─────┼───────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │ DOMAIN (azul)         │
              │ Entidades + Puertos   │
              │ decideModel()         │
              └───────────┬───────────┘
         puertos          │
    ┌────────────┬────────┼────────┬──────────┬─────────┐
    ▼            ▼        ▼        ▼          ▼         ▼
 Sanitizer   Classifier  LLM    Cache      Budget    Audit
 (regex)     (heurística) router  Map RAM    Map RAM   array
                    │
                    ├─ LlamaAdapter  (simulado)
                    └─ OpenAiAdapter (simulado)

DRIVING (entrada)                         DRIVEN (salida)
CompletionController                      los 6 adapters de arriba
DebugController                           DomainExceptionFilter
```

Equivalencia con el dibujo de Products:

| Diagrama Products | Este gateway |
|-------------------|--------------|
| Controller HTTP | `CompletionController` |
| Use case CRUD | `CompletePromptUseCase` |
| Entidad Product | `CompletionRequest`, `MaskedPrompt`, `RoutingDecision` |
| Puerto Repository | 6 puertos (`SanitizerPort`, `ClassifierPort`, …) |
| Adapter Drizzle + SQLite | regex, Map, LLM falso |

`AppModule` es el **único** archivo que une azul + naranja:

```ts
{ provide: SANITIZER, useClass: RegexSanitizerAdapter }
```

El use case inyecta `SANITIZER` (símbolo), no la clase regex.

---

## 5. Estructura de carpetas

```
src/
  domain/                         ← azul. Cero Nest HTTP, cero Redis, cero OpenAI
    entities/                     CompletionRequest, MaskedPrompt, …
    ports/                        interfaces + tokens de inyección
    errors/                       DomainError, BlockedPii, BudgetExceeded
    routing-policy.ts             decideModel + costos
  application/                    ← verde
    use-cases/complete-prompt.use-case.ts
  infrastructure/                 ← naranja
    http/                         driving: controller + filter
    sanitizer/                    driven: regex
    classifier/                   driven: heurística
    llm/                          driven: router + llama + openai
    cache/ budget/ audit/         driven: RAM (mañana Redis / SQLite)
  app.module.ts                   enchufe
  main.ts                         listen :3000
```

Cada archivo de `src/` tiene un comentario de cabecera: **capa, rol, de dónde viene, a dónde va.**

---

## 6. Comandos usados para crear el proyecto

Corridos en `c:\xampp\htdocs\nivelUno`:

```bash
node -v          # v26.1.0
npm -v           # 11.14.1

npx -y @nestjs/cli new . --skip-git --package-manager npm --strict --language ts
```

Después se reemplazó el Hello World por las tres capas. El CLI dejó `package.json`, `tsconfig.json`, Vitest y el runtime Nest.

---

## 7. Cómo saber que entendiste hexagonal

1. `CompletePromptUseCase` **no importa** `regex-sanitizer` ni `openai.adapter`.
2. El test `complete-prompt.use-case.spec.ts` corre con objetos fake: **cero Nest HTTP**.
3. Cambiar RAM → Redis es **una línea** en `app.module.ts` (`useClass`).
4. HTTP 402/422 nacen en el **filter**, no en el dominio.

Si el use case empieza a usar `fetch` o `Req()`, se rompió el hexágono.

---

## 8. Qué queda a propósito fuera (siguiente práctica)

- Redis real (`SETEX`, `INCRBYFLOAT`)
- Ollama / OpenAI de verdad (el `fetch` iría **solo** en `llama.adapter.ts` / `openai.adapter.ts`)
- NER tipo Presidio
- OpenAPI / Swagger (no hace falta para este ejercicio)
- Angular como cliente del `POST /v1/completions`

---

## 9. Logs para seguir el flujo en vivo

Con `npm run start:dev`, cada request imprime:

```
[CompletePromptUseCase] [1] Sanitizar …
[CompletePromptUseCase] [2] Cache MISS
[CompletePromptUseCase] [3] Score …
[CompletePromptUseCase] [4] Modelo=…
[CompletePromptUseCase] [5] Presupuesto OK
[CompletePromptUseCase] [6] Llamar LLM …
[LlmRouter] despachar a llama3
[CompletePromptUseCase] [7] Cobrado=…
[CompletePromptUseCase] [8] hydrate=false
```

Es el algoritmo, línea por línea.
