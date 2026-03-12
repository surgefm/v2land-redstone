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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const middlewares_1 = require("@Sockets/middlewares");
const lodash_1 = __importDefault(require("lodash"));
const getRoomName_1 = __importDefault(require("./getRoomName"));
const newsroomPath_1 = __importDefault(require("./newsroomPath"));
const wrapSocket_1 = __importDefault(require("../wrapSocket"));
const addEventToStack_1 = __importDefault(require("./addEventToStack"));
const addEventToTag_1 = __importDefault(require("./addEventToTag"));
const addNewsToEvent_1 = __importDefault(require("./addNewsToEvent"));
const addNewsToStack_1 = __importDefault(require("./addNewsToStack"));
const createStack_1 = __importDefault(require("./createStack"));
const inviteEditor_1 = __importDefault(require("./inviteEditor"));
const inviteManager_1 = __importDefault(require("./inviteManager"));
const inviteViewer_1 = __importDefault(require("./inviteViewer"));
const lockResource_1 = __importDefault(require("./lockResource"));
const makeCommit_1 = __importDefault(require("./makeCommit"));
const removeEditor_1 = __importDefault(require("./removeEditor"));
const removeManager_1 = __importDefault(require("./removeManager"));
const removeViewer_1 = __importDefault(require("./removeViewer"));
const removeEventFromStack_1 = __importDefault(require("./removeEventFromStack"));
const removeEventFromTag_1 = __importDefault(require("./removeEventFromTag"));
const removeNewsFromEvent_1 = __importDefault(require("./removeNewsFromEvent"));
const removeNewsFromStack_1 = __importDefault(require("./removeNewsFromStack"));
const unlockResource_1 = __importDefault(require("./unlockResource"));
const updateEvent_1 = __importDefault(require("./updateEvent"));
const updateHeaderImage_1 = __importDefault(require("./updateHeaderImage"));
const updateStack_1 = __importDefault(require("./updateStack"));
const updateStackOrders_1 = __importDefault(require("./updateStackOrders"));
function loadNewsroom(io) {
    const newsroom = io.of(newsroomPath_1.default);
    newsroom.use(middlewares_1.isLoggedIn);
    newsroom.on('connection', (rawSocket) => {
        const socket = (0, wrapSocket_1.default)(rawSocket);
        socket.on('join newsroom', (eventId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
            const { clientId } = socket.handshake.session;
            const event = yield _Models_1.Event.findByPk(eventId);
            if (!event)
                return cb('Event not found');
            const hasAccess = event.status === 'admitted' ||
                (yield _Services_1.AccessControlService.isAllowedToViewEvent(clientId, eventId));
            if (!hasAccess) {
                return cb('You don\'t have access to the newsroom');
            }
            const roomName = (0, getRoomName_1.default)(eventId);
            yield socket.join(roomName);
            yield _Services_1.RedisService.hset(`socket:client-${clientId}-${eventId}`, socket.id, true);
            socket.in(roomName).emit('join newsroom', { eventId, clientId });
            const resourceLocks = yield _Services_1.ResourceLockService.getEventLockedResourceList(eventId);
            const roles = yield _Services_1.AccessControlService.getEventClients(eventId);
            if (_Services_1.RedisService.redis) {
                const sockets = yield newsroom.in(roomName).allSockets();
                const clients = Array.from(sockets).map(client => `socket:${client}`);
                const clientIds = clients.length === 0 ? [] : lodash_1.default.uniq(yield _Services_1.RedisService.mget(...clients));
                cb(null, {
                    resourceLocks,
                    clients: clientIds,
                    roles,
                });
            }
            else {
                cb(null, {
                    resourceLocks,
                    clients: [clientId],
                    roles,
                });
            }
        }));
        const leaveNewsroom = (eventId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
            const { clientId } = socket.handshake.session;
            const rooms = typeof eventId === 'number'
                ? [(0, getRoomName_1.default)(eventId)]
                : Object.keys(socket.rooms).map(key => socket.rooms[key]);
            for (let i = 0; i < rooms.length; i++) {
                const split = rooms[i].split('-');
                const eventId = +split[split.length - 1];
                socket.in(rooms[i]).emit('leave newsroom', { eventId, clientId });
                socket.leave(rooms[i]);
                yield _Services_1.RedisService.hdel(`socket:client-${clientId}-${eventId}`, socket.id);
            }
            cb();
        });
        socket.on('leave newsroom', leaveNewsroom);
        rawSocket.on('disconnect', () => leaveNewsroom(null));
        (0, addEventToStack_1.default)(socket);
        (0, addEventToTag_1.default)(socket);
        (0, addNewsToEvent_1.default)(socket);
        (0, addNewsToStack_1.default)(socket);
        (0, createStack_1.default)(socket);
        (0, inviteEditor_1.default)(socket);
        (0, inviteManager_1.default)(socket);
        (0, inviteViewer_1.default)(socket);
        (0, lockResource_1.default)(socket);
        (0, makeCommit_1.default)(socket);
        (0, removeEditor_1.default)(socket, io);
        (0, removeManager_1.default)(socket, io);
        (0, removeViewer_1.default)(socket, io);
        (0, removeEventFromStack_1.default)(socket);
        (0, removeEventFromTag_1.default)(socket);
        (0, removeNewsFromEvent_1.default)(socket);
        (0, removeNewsFromStack_1.default)(socket);
        (0, unlockResource_1.default)(socket);
        (0, updateEvent_1.default)(socket);
        (0, updateHeaderImage_1.default)(socket);
        (0, updateStack_1.default)(socket);
        (0, updateStackOrders_1.default)(socket);
    });
}
exports.default = loadNewsroom;

//# sourceMappingURL=index.js.map
