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
const Stack_1 = __importDefault(require("./Stack"));
const EventStackNews_1 = __importDefault(require("./EventStackNews"));
const Event_1 = __importDefault(require("./Event"));
const Site_1 = __importDefault(require("./Site"));
const SiteAccount_1 = __importDefault(require("./SiteAccount"));
let News = class News extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.IsUrl,
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], News.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], News.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], News.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Length)({ min: 0, max: 203 }),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], News.prototype, "abstract", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], News.prototype, "time", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('pending'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('pending', 'admitted', 'rejected', 'removed')),
    __metadata("design:type", String)
], News.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], News.prototype, "comment", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Stack_1.default, () => EventStackNews_1.default),
    __metadata("design:type", Array)
], News.prototype, "stacks", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Event_1.default, () => EventStackNews_1.default),
    __metadata("design:type", Array)
], News.prototype, "events", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Site_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], News.prototype, "siteId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Site_1.default, 'siteId'),
    __metadata("design:type", Site_1.default)
], News.prototype, "site", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => SiteAccount_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], News.prototype, "siteAccountId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => SiteAccount_1.default, 'siteAccountId'),
    __metadata("design:type", SiteAccount_1.default)
], News.prototype, "siteAccount", void 0);
News = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'news',
        freezeTableName: true,
    })
], News);
exports.default = News;

//# sourceMappingURL=News.js.map
