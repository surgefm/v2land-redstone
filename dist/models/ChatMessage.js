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
const Chat_1 = __importDefault(require("./Chat"));
let ChatMessage = class ChatMessage extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.IsUUID)(4),
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], ChatMessage.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], ChatMessage.prototype, "text", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], ChatMessage.prototype, "authorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Client_1.default, 'authorId'),
    __metadata("design:type", Client_1.default)
], ChatMessage.prototype, "author", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Chat_1.default),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], ChatMessage.prototype, "chatId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Chat_1.default, 'chatId'),
    __metadata("design:type", Chat_1.default)
], ChatMessage.prototype, "chat", void 0);
ChatMessage = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'chatMessage',
        freezeTableName: true,
    })
], ChatMessage);
exports.default = ChatMessage;

//# sourceMappingURL=ChatMessage.js.map
