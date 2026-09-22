var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let InMemoryAuditAdapter = class InMemoryAuditAdapter {
    entries = [];
    async log(entry) {
        this.entries.push(entry);
    }
    async list(tenantId) {
        return this.entries.filter((e) => e.tenantId === tenantId);
    }
};
InMemoryAuditAdapter = __decorate([
    Injectable()
], InMemoryAuditAdapter);
export { InMemoryAuditAdapter };
//# sourceMappingURL=in-memory-audit.adapter.js.map