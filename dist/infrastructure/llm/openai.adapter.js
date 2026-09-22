var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenAiAdapter_1;
import { Injectable, Logger } from '@nestjs/common';
let OpenAiAdapter = OpenAiAdapter_1 = class OpenAiAdapter {
    logger = new Logger(OpenAiAdapter_1.name);
    async complete(input) {
        this.logger.log(`[OpenAiAdapter] modelo=${input.model} prompt masked (${input.prompt.length} chars)`);
        return {
            text: `[${input.model}] (modelo de pago, simulado) Recibí SOLO texto enmascarado: ${input.prompt}`,
            inputTokens: Math.max(1, Math.ceil(input.prompt.length / 4)),
            outputTokens: input.model === 'gpt-4o' ? 48 : 32,
        };
    }
};
OpenAiAdapter = OpenAiAdapter_1 = __decorate([
    Injectable()
], OpenAiAdapter);
export { OpenAiAdapter };
//# sourceMappingURL=openai.adapter.js.map