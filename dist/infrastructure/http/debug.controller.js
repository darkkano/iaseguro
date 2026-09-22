var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Headers, Inject } from '@nestjs/common';
import { AUDIT, BUDGET } from '../../domain/ports/tokens.js';
let DebugController = class DebugController {
    budget;
    audit;
    constructor(budget, audit) {
        this.budget = budget;
        this.audit = audit;
    }
    budgetStatus(tenantHeader) {
        const tenantId = tenantHeader?.trim() || 'demo';
        return this.budget.getStatus(tenantId);
    }
    auditLog(tenantHeader) {
        const tenantId = tenantHeader?.trim() || 'demo';
        return this.audit.list(tenantId);
    }
};
__decorate([
    Get('budget'),
    __param(0, Headers('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "budgetStatus", null);
__decorate([
    Get('audit'),
    __param(0, Headers('x-tenant-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DebugController.prototype, "auditLog", null);
DebugController = __decorate([
    Controller('v1'),
    __param(0, Inject(BUDGET)),
    __param(1, Inject(AUDIT)),
    __metadata("design:paramtypes", [Object, Object])
], DebugController);
export { DebugController };
//# sourceMappingURL=debug.controller.js.map