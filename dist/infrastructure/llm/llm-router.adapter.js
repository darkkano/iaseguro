var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LlmRouterAdapter_1;
import { Injectable, Logger } from '@nestjs/common';
import { LlamaAdapter } from './llama.adapter.js';
import { OpenAiAdapter } from './openai.adapter.js';
let LlmRouterAdapter = LlmRouterAdapter_1 = class LlmRouterAdapter {
    llama;
    openai;
    logger = new Logger(LlmRouterAdapter_1.name);
    constructor(llama, openai) {
        this.llama = llama;
        this.openai = openai;
    }
    complete(input) {
        this.logger.log(`[LlmRouter] despachar a ${input.model}`);
        if (input.model === 'llama3') {
            return this.llama.complete(input);
        }
        return this.openai.complete(input);
    }
};
LlmRouterAdapter = LlmRouterAdapter_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [LlamaAdapter,
        OpenAiAdapter])
], LlmRouterAdapter);
export { LlmRouterAdapter };
//# sourceMappingURL=llm-router.adapter.js.map