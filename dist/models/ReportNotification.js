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
const Report_1 = __importDefault(require("./Report"));
const Notification_1 = __importDefault(require("./Notification"));
let ReportNotification = class ReportNotification extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('pending'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('pending', 'complete', 'invalid')),
    __metadata("design:type", String)
], ReportNotification.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Report_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ReportNotification.prototype, "reportId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Notification_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ReportNotification.prototype, "notificationId", void 0);
ReportNotification = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'reportNotification',
        freezeTableName: true,
    })
], ReportNotification);
exports.default = ReportNotification;

//# sourceMappingURL=ReportNotification.js.map
