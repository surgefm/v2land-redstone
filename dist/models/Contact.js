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
const Subscription_1 = __importDefault(require("./Subscription"));
const Auth_1 = __importDefault(require("./Auth"));
let Contact = class Contact extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Contact.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('email', 'twitter', 'weibo', 'telegram', 'mobileApp')),
    __metadata("design:type", String)
], Contact.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('twitter', 'weibo', 'twitterAt', 'weiboAt', 'email', 'emailDailyReport', 'mobileAppNotification')),
    __metadata("design:type", String)
], Contact.prototype, "method", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)('active'),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('active', 'inactive', 'expired')),
    __metadata("design:type", String)
], Contact.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Contact.prototype, "unsubscribeId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'owner'),
    __metadata("design:type", Client_1.default)
], Contact.prototype, "ownedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Subscription_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "subscriptionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Subscription_1.default, 'subscriptionId'),
    __metadata("design:type", Subscription_1.default)
], Contact.prototype, "subscription", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Auth_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Contact.prototype, "authId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Auth_1.default, 'authId'),
    __metadata("design:type", Auth_1.default)
], Contact.prototype, "auth", void 0);
Contact = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'contact',
        freezeTableName: true,
    })
], Contact);
exports.default = Contact;

//# sourceMappingURL=Contact.js.map
