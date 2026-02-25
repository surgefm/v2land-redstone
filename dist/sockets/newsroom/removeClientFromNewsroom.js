"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Services_1 = require("@Services");
const getRoomName_1 = __importDefault(require("./getRoomName"));
const newsroomPath_1 = __importDefault(require("./newsroomPath"));
function removeClientFromNewsroom(server, eventId, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `socket:client-${clientId}-${eventId}`;
        const obj = yield _Services_1.RedisService.hgetall(key);
        const socketIds = Object.keys(obj);
        const room = (0, getRoomName_1.default)(eventId);
        server.of(newsroomPath_1.default).in(room).emit('leave newsroom', { eventId, clientId });
        for (const id of socketIds) {
            const s = server.of(newsroomPath_1.default).sockets.get(id);
            if (s) {
                s.leave(room);
            }
            yield _Services_1.RedisService.hdel(key, id);
        }
    });
}
exports.default = removeClientFromNewsroom;

//# sourceMappingURL=removeClientFromNewsroom.js.map
