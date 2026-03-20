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
var EventContributor_1;
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Event_1 = __importDefault(require("./Event"));
const Client_1 = __importDefault(require("./Client"));
const Commit_1 = __importDefault(require("./Commit"));
let EventContributor = EventContributor_1 = class EventContributor extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Event_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], EventContributor.prototype, "eventId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Commit_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], EventContributor.prototype, "commitId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Client_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], EventContributor.prototype, "contributorId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => EventContributor_1),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], EventContributor.prototype, "parentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.FLOAT),
    __metadata("design:type", Number)
], EventContributor.prototype, "points", void 0);
EventContributor = EventContributor_1 = __decorate([
    (0, sequelize_typescript_1.Table)({
        modelName: 'eventContributor',
        freezeTableName: true,
    })
], EventContributor);
exports.default = EventContributor;

//# sourceMappingURL=EventContributor.js.map
