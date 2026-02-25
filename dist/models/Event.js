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
var Event_1;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const lodash_1 = __importDefault(require("lodash"));
const HeaderImage_1 = __importDefault(require("./HeaderImage"));
const Stack_1 = __importDefault(require("./Stack"));
const News_1 = __importDefault(require("./News"));
const Critique_1 = __importDefault(require("./Critique"));
const Notification_1 = __importDefault(require("./Notification"));
const Subscription_1 = __importDefault(require("./Subscription"));
const EventStackNews_1 = __importDefault(require("./EventStackNews"));
const EventTag_1 = __importDefault(require("./EventTag"));
const Tag_1 = __importDefault(require("./Tag"));
const Client_1 = __importDefault(require("./Client"));
const Star_1 = __importDefault(require("./Star"));
let Event = Event_1 = class Event extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Is)('EventName', (value) => {
        if (!lodash_1.default.isString(value) || value.length === 0) {
            throw new Error('时间线名不得为空');
        }
        else if (value.trim() !== value) {
            throw new Error('时间线名两端不应含有空格');
        }
        let allDigit = true;
        for (const char of value) {
            if (!/\d/.test(char)) {
                allDigit = false;
                break;
            }
        }
        if (allDigit) {
            throw new Error('时间线名不得全为数字');
        }
        const reserved = [
            'register', 'new', 'setting', 'admin', 'dashboard', 'trending',
            'about', 'subscription', 'index', 'login', 'verify', 'list',
            'pending', 'post', 'topic', 'event', 'home', 'logout', 'signup',
        ];
        if (reserved.includes(value)) {
            throw new Error(`时间线名不得为以下文字：${reserved.join(', ')}`);
        }
    }),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Event.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Event.prototype, "pinyin", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('pending'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM('pending', 'admitted', 'rejected', 'hidden', 'removed')),
    __metadata("design:type", String)
], Event.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Event.prototype, "needContributor", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => HeaderImage_1.default, 'eventId'),
    __metadata("design:type", HeaderImage_1.default)
], Event.prototype, "headerImage", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Stack_1.default, 'eventId'),
    __metadata("design:type", Array)
], Event.prototype, "stacks", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Critique_1.default, 'eventId'),
    __metadata("design:type", Array)
], Event.prototype, "critiques", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Notification_1.default, 'eventId'),
    __metadata("design:type", Array)
], Event.prototype, "notifications", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Subscription_1.default, 'eventId'),
    __metadata("design:type", Array)
], Event.prototype, "subscriptions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Star_1.default, 'eventId'),
    __metadata("design:type", Array)
], Event.prototype, "stars", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => News_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Event.prototype, "latestAdmittedNewsId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => News_1.default, 'latestAdmittedNewsId'),
    __metadata("design:type", News_1.default)
], Event.prototype, "latestAdmittedNews", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Event.prototype, "ownerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'ownerId'),
    __metadata("design:type", Client_1.default)
], Event.prototype, "owner", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Event.prototype, "parentId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Event_1, 'parentId'),
    __metadata("design:type", Event)
], Event.prototype, "parent", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => Tag_1.default, () => EventTag_1.default),
    __metadata("design:type", Array)
], Event.prototype, "tags", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => News_1.default, () => EventStackNews_1.default),
    __metadata("design:type", Array)
], Event.prototype, "news", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => News_1.default, () => EventStackNews_1.default),
    __metadata("design:type", Array)
], Event.prototype, "offshelfNews", void 0);
Event = Event_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'event',
        freezeTableName: true,
    })
], Event);
exports.default = Event;

//# sourceMappingURL=Event.js.map
