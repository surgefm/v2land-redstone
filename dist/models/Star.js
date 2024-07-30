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
const sequelize_typescript_1 = require("sequelize-typescript");
const Event_1 = __importDefault(require("./Event"));
const Client_1 = __importDefault(require("./Client"));
let Star = class Star extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Star.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default),
    __metadata("design:type", Client_1.default)
], Star.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Star.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default),
    __metadata("design:type", Event_1.default)
], Star.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Star.prototype, "eventId", void 0);
Star = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'star',
        freezeTableName: true,
    })
], Star);
exports.default = Star;

//# sourceMappingURL=Star.js.map
