var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let HeuristicClassifierAdapter = class HeuristicClassifierAdapter {
    score(maskedPrompt) {
        let score = 0;
        const p = maskedPrompt;
        if (/analiza|arquitectura|refactor|demuestra|diseña un sistema/i.test(p)) {
            score += 5;
        }
        else if (/compara|explica por qu[eé]|explica las ventajas/i.test(p)) {
            score += 3;
        }
        if (p.length > 500)
            score += 2;
        if (/```/.test(p))
            score += 2;
        if ((p.match(/\?/g) ?? []).length > 2)
            score += 1;
        return score;
    }
};
HeuristicClassifierAdapter = __decorate([
    Injectable()
], HeuristicClassifierAdapter);
export { HeuristicClassifierAdapter };
//# sourceMappingURL=heuristic-classifier.adapter.js.map