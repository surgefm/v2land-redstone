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
const Event_1 = __importDefault(require("./Event"));
const Report_1 = __importDefault(require("./Report"));
const ReportNotification_1 = __importDefault(require("./ReportNotification"));
let Notification = class Notification extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(new Date()),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Notification.prototype, "time", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('EveryNewStack', '30DaysSinceLatestStack', 'new', '7DaysSinceLatestNews', 'daily', 'weekly', 'monthly', 'EveryFriday')),
    __metadata("design:type", String)
], Notification.prototype, "mode", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('pending'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('pending', 'ongoing', 'complete', 'discarded')),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Notification.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default, 'eventId'),
    __metadata("design:type", Event_1.default)
], Notification.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Report_1.default, () => ReportNotification_1.default, 'notificationId', 'reportId'),
    __metadata("design:type", Array)
], Notification.prototype, "reports", void 0);
Notification = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'notification',
        freezeTableName: true,
    })
], Notification);
exports.default = Notification;

//# sourceMappingURL=Notification.js.map
