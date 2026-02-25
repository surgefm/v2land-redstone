"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceLockStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Client_1 = __importDefault(require("./Client"));
const Event_1 = __importDefault(require("./Event"));
var ResourceLockStatus;
(function (ResourceLockStatus) {
    ResourceLockStatus["ACTIVE"] = "active";
    ResourceLockStatus["UNLOCKED"] = "unlocked";
    ResourceLockStatus["EXPIRED"] = "expired";
})(ResourceLockStatus = exports.ResourceLockStatus || (exports.ResourceLockStatus = {}));
let ResourceLock = class ResourceLock extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], ResourceLock.prototype, "model", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ResourceLock.prototype, "resourceId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], ResourceLock.prototype, "expires", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(ResourceLockStatus.ACTIVE),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('active', 'unlocked', 'expired')),
    __metadata("design:type", String)
], ResourceLock.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ResourceLock.prototype, "locker", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'locker'),
    __metadata("design:type", Client_1.default)
], ResourceLock.prototype, "lockedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ResourceLock.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default, 'eventId'),
    __metadata("design:type", Event_1.default)
], ResourceLock.prototype, "event", void 0);
ResourceLock = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'resourceLock',
        freezeTableName: true,
    })
], ResourceLock);
exports.default = ResourceLock;

//# sourceMappingURL=ResourceLock.js.map
