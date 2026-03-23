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
var Tag_1;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Client_1 = __importDefault(require("./Client"));
const Event_1 = __importDefault(require("./Event"));
const EventTag_1 = __importDefault(require("./EventTag"));
const TagCurator_1 = __importDefault(require("./TagCurator"));
let Tag = Tag_1 = class Tag extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Tag.prototype, "slug", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Tag.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.INTEGER)),
    __metadata("design:type", Array)
], Tag.prototype, "hierarchyPath", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.ForeignKey)(() => Tag_1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Tag.prototype, "redirectToId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Tag_1),
    __metadata("design:type", Tag)
], Tag.prototype, "redirectTo", void 0);
__decorate([
    sequelize_typescript_1.AllowNull,
    (0, sequelize_typescript_1.ForeignKey)(() => Tag_1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Tag.prototype, "parentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Tag_1),
    __metadata("design:type", Tag)
], Tag.prototype, "parent", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)('visible'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('visible', 'hidden')),
    __metadata("design:type", String)
], Tag.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Event_1.default, () => EventTag_1.default),
    __metadata("design:type", Array)
], Tag.prototype, "events", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Client_1.default, () => TagCurator_1.default),
    __metadata("design:type", Array)
], Tag.prototype, "curators", void 0);
Tag = Tag_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'tag',
        freezeTableName: true,
    })
], Tag);
exports.default = Tag;

//# sourceMappingURL=Tag.js.map
