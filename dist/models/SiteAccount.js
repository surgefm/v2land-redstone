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
const Site_1 = __importDefault(require("./Site"));
const News_1 = __importDefault(require("./News"));
let SiteAccount = class SiteAccount extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], SiteAccount.prototype, "username", void 0);
__decorate([
    sequelize_typescript_1.IsUrl,
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], SiteAccount.prototype, "homepage", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], SiteAccount.prototype, "avatar", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Site_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], SiteAccount.prototype, "siteId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Site_1.default, 'siteId'),
    __metadata("design:type", Site_1.default)
], SiteAccount.prototype, "site", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => News_1.default, 'siteAccountId'),
    __metadata("design:type", Array)
], SiteAccount.prototype, "news", void 0);
SiteAccount = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'siteAccount',
        freezeTableName: true,
    })
], SiteAccount);
exports.default = SiteAccount;

//# sourceMappingURL=SiteAccount.js.map
