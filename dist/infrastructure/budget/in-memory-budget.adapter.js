var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InMemoryBudgetAdapter_1;
import { Injectable } from '@nestjs/common';
let InMemoryBudgetAdapter = class InMemoryBudgetAdapter {
    static { InMemoryBudgetAdapter_1 = this; }
    static LIMIT_USD = 0.05;
    spent = new Map();
    async canSpend(tenantId, estimatedUsd) {
        const current = this.spent.get(tenantId) ?? 0;
        return current + estimatedUsd <= InMemoryBudgetAdapter_1.LIMIT_USD;
    }
    async addSpend(tenantId, usd) {
        const current = this.spent.get(tenantId) ?? 0;
        this.spent.set(tenantId, Number((current + usd).toFixed(6)));
    }
    async getStatus(tenantId) {
        const spentUsd = this.spent.get(tenantId) ?? 0;
        const limitUsd = InMemoryBudgetAdapter_1.LIMIT_USD;
        return {
            spentUsd,
            limitUsd,
            remainingUsd: Number((limitUsd - spentUsd).toFixed(6)),
        };
    }
};
InMemoryBudgetAdapter = InMemoryBudgetAdapter_1 = __decorate([
    Injectable()
], InMemoryBudgetAdapter);
export { InMemoryBudgetAdapter };
//# sourceMappingURL=in-memory-budget.adapter.js.map