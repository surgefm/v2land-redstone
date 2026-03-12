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
const Client_1 = __importDefault(require("./Client"));
const Contact_1 = __importDefault(require("./Contact"));
let Subscription = class Subscription extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('EveryNewStack', '30DaysSinceLatestStack', 'new', '7DaysSinceLatestNews', 'daily', 'weekly', 'monthly', 'EveryFriday')),
    __metadata("design:type", String)
], Subscription.prototype, "mode", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('active'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('active', 'unsubscribed')),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Subscription.prototype, "unsubscribeId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Subscription.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1.default, 'eventId'),
    __metadata("design:type", Event_1.default)
], Subscription.prototype, "event", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Subscription.prototype, "subscriber", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'subscriber'),
    __metadata("design:type", Client_1.default)
], Subscription.prototype, "subscribedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Contact_1.default, 'subscriptionId'),
    __metadata("design:type", Array)
], Subscription.prototype, "contacts", void 0);
Subscription = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'subscription',
        freezeTableName: true,
    })
], Subscription);
exports.default = Subscription;

//# sourceMappingURL=Subscription.js.map
