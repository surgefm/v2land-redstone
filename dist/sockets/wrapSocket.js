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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps a Socket so that any async event handler registered via `.on()`
 * automatically catches rejected promises and forwards the error message
 * to the callback (the last argument), preventing unhandled rejections
 * from crashing the process.
 */
function wrapSocket(socket) {
    const originalOn = socket.on.bind(socket);
    socket.on = function (event, handler) {
        return originalOn(event, (...args) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield handler(...args);
            }
            catch (err) {
                console.error(`[Socket] Error in handler "${event}":`, err);
                // Convention: the last argument is a callback function
                const cb = args[args.length - 1];
                if (typeof cb === 'function') {
                    cb(err instanceof Error ? err.message : String(err));
                }
            }
        }));
    };
    return socket;
}
exports.default = wrapSocket;

//# sourceMappingURL=wrapSocket.js.map
