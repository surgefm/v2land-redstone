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
const SiteAccount_1 = __importDefault(require("./SiteAccount"));
const News_1 = __importDefault(require("./News"));
let Site = class Site extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Site.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Site.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Site.prototype, "icon", void 0);
__decorate([
    sequelize_typescript_1.IsUrl,
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Site.prototype, "homepage", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => SiteAccount_1.default, 'siteId'),
    __metadata("design:type", Array)
], Site.prototype, "accounts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => News_1.default, 'siteId'),
    __metadata("design:type", Array)
], Site.prototype, "news", void 0);
Site = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'site',
        freezeTableName: true,
    })
], Site);
exports.default = Site;

//# sourceMappingURL=Site.js.map
