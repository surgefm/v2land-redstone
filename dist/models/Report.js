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
const Notification_1 = __importDefault(require("./Notification"));
const ReportNotification_1 = __importDefault(require("./ReportNotification"));
let Report = class Report extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(new Date()),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Report.prototype, "time", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('daily'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('daily', 'weekly', 'monthly')),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('email'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('email', 'telegram')),
    __metadata("design:type", String)
], Report.prototype, "method", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('pending'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('pending', 'ongoing', 'complete', 'invalid')),
    __metadata("design:type", String)
], Report.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Report.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'owner'),
    __metadata("design:type", Client_1.default)
], Report.prototype, "ownedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Notification_1.default, () => ReportNotification_1.default, 'reportId', 'notificationId'),
    __metadata("design:type", Array)
], Report.prototype, "notifications", void 0);
Report = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'report',
        freezeTableName: true,
    })
], Report);
exports.default = Report;

//# sourceMappingURL=Report.js.map
