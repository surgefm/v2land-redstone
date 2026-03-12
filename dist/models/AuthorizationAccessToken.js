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
let AuthorizationAccessToken = class AuthorizationAccessToken extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationAccessToken.prototype, "token", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationAccessToken.prototype, "refreshToken", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], AuthorizationAccessToken.prototype, "expire", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)('active'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('active', 'revoked')),
    __metadata("design:type", String)
], AuthorizationAccessToken.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AuthorizationAccessToken.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'owner'),
    __metadata("design:type", Client_1.default)
], AuthorizationAccessToken.prototype, "ownedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => AuthorizationClient_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AuthorizationAccessToken.prototype, "authorizationClientId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => AuthorizationClient_1.default, 'authorizationClientId'),
    __metadata("design:type", AuthorizationClient_1.default)
], AuthorizationAccessToken.prototype, "authorizationClient", void 0);
AuthorizationAccessToken = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'authorizationAccessToken',
        freezeTableName: true,
    })
], AuthorizationAccessToken);
exports.default = AuthorizationAccessToken;

//# sourceMappingURL=AuthorizationAccessToken.js.map
