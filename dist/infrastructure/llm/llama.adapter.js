var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LlamaAdapter_1;
import { Injectable, Logger } from '@nestjs/common';
let LlamaAdapter = LlamaAdapter_1 = class LlamaAdapter {
    logger = new Logger(LlamaAdapter_1.name);
    async complete(input) {
        this.logger.log(`[LlamaAdapter] prompt masked recibido (${input.prompt.length} chars)`);
        return {
            text: `[llama3] (modelo barato, simulado) Recibí SOLO texto enmascarado: ${input.prompt}`,
            inputTokens: estimateTokens(input.prompt),
            outputTokens: 24,
        };
    }
};
LlamaAdapter = LlamaAdapter_1 = __decorate([
    Injectable()
], LlamaAdapter);
export { LlamaAdapter };
function estimateTokens(text) {
    return Math.max(1, Math.ceil(text.length / 4));
}
//# sourceMappingURL=llama.adapter.js.map