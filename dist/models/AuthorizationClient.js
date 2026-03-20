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
const AuthorizationCode_1 = __importDefault(require("./AuthorizationCode"));
const AuthorizationAccessToken_1 = __importDefault(require("./AuthorizationAccessToken"));
let AuthorizationClient = class AuthorizationClient extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationClient.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationClient.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationClient.prototype, "redirectURI", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    sequelize_typescript_1.Column,
    __metadata("design:type", Boolean)
], AuthorizationClient.prototype, "allowAuthorizationByCredentials", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], AuthorizationClient.prototype, "secret", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], AuthorizationClient.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'owner'),
    __metadata("design:type", Client_1.default)
], AuthorizationClient.prototype, "ownedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AuthorizationCode_1.default, 'authorizationClientId'),
    __metadata("design:type", Array)
], AuthorizationClient.prototype, "authorizationCodes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AuthorizationAccessToken_1.default, 'authorizationClientId'),
    __metadata("design:type", Array)
], AuthorizationClient.prototype, "authorizationAccessTokens", void 0);
AuthorizationClient = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'authorizationClient',
        freezeTableName: true,
    })
], AuthorizationClient);
exports.default = AuthorizationClient;

//# sourceMappingURL=AuthorizationClient.js.map
