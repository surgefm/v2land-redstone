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
const lodash_1 = __importDefault(require("lodash"));
const Record_1 = __importDefault(require("./Record"));
const Auth_1 = __importDefault(require("./Auth"));
const Subscription_1 = __importDefault(require("./Subscription"));
const Contact_1 = __importDefault(require("./Contact"));
const Report_1 = __importDefault(require("./Report"));
const AuthorizationCode_1 = __importDefault(require("./AuthorizationCode"));
const AuthorizationAccessToken_1 = __importDefault(require("./AuthorizationAccessToken"));
const Tag_1 = __importDefault(require("./Tag"));
const TagCurator_1 = __importDefault(require("./TagCurator"));
const Event_1 = __importDefault(require("./Event"));
const Star_1 = __importDefault(require("./Star"));
let Client = class Client extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Is)('Username', (value) => {
        if (!lodash_1.default.isString(value) || value.length < 2 || value.length > 16) {
            throw new Error('用户名长度应在 2-16 个字符内');
        }
        if (/[^a-zA-Z0-9]/.test(value)) {
            throw new Error('用户名不得含有除 a-z，A-Z，0-9 外的字符');
        }
        if (/^\d+$/.test(value)) {
            throw new Error('用户名不得全为数字');
        }
        const unavailableUsernameSet = new Set(['event', 'topic', 'register',
            'login', 'logout', 'about', 'dashboard', 'trending', 'topics', 'settings', 'signup']);
        if (unavailableUsernameSet.has(value)) {
            throw new Error('用户名不可用');
        }
    }),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Unique)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "username", void 0);
__decorate([
    (0, sequelize_typescript_1.Is)('Nickname', (value) => {
        if (!lodash_1.default.isString(value) || value.length < 2 || value.length > 16) {
            throw new Error('昵称长度应在 2-16 个字符内');
        }
        else if (/\r?\n|\r|@|%/.test(value)) {
            throw new Error('昵称不得含有 @ 或 %。');
        }
        let allDigit = true;
        for (const char of value) {
            if (!/\d/.test(char)) {
                allDigit = false;
                break;
            }
        }
        if (allDigit) {
            throw new Error('昵称不得全为数字');
        }
    }),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Unique)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "nickname", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('contributor'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('admin', 'manager', 'contributor', 'editor')),
    __metadata("design:type", String)
], Client.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Client.prototype, "avatar", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Client.prototype, "emailVerified", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)({}),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSONB),
    __metadata("design:type", Object)
], Client.prototype, "settings", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Record_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "records", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Auth_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "auths", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Subscription_1.default, 'subscriber'),
    __metadata("design:type", Array)
], Client.prototype, "subscriptions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Contact_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "contacts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Report_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "reports", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AuthorizationCode_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "authorizationCodes", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => AuthorizationAccessToken_1.default, 'owner'),
    __metadata("design:type", Array)
], Client.prototype, "authorizationAccessTokens", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Star_1.default, 'clientId'),
    __metadata("design:type", Array)
], Client.prototype, "stars", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Tag_1.default, () => TagCurator_1.default),
    __metadata("design:type", Array)
], Client.prototype, "tags", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Event_1.default, 'ownerId'),
    __metadata("design:type", Array)
], Client.prototype, "events", void 0);
Client = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'client',
        freezeTableName: true,
    })
], Client);
exports.default = Client;

//# sourceMappingURL=Client.js.map
