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
const Client_1 = __importDefault(require("./Client"));
const AuthorizationClient_1 = __importDefault(require("./AuthorizationClient"));
let AuthorizationCode = class AuthorizationCode extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], AuthorizationCode.prototype, "expire", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "codeChallenge", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationCode.prototype, "codeChallengeMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AuthorizationCode.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'owner'),
    __metadata("design:type", Client_1.default)
], AuthorizationCode.prototype, "ownedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => AuthorizationClient_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AuthorizationCode.prototype, "authorizationClientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => AuthorizationClient_1.default, 'authorizationClientId'),
    __metadata("design:type", AuthorizationClient_1.default)
], AuthorizationCode.prototype, "authorizationClient", void 0);
AuthorizationCode = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'authorizationCode',
        freezeTableName: true,
    })
], AuthorizationCode);
exports.default = AuthorizationCode;

//# sourceMappingURL=AuthorizationCode.js.map
