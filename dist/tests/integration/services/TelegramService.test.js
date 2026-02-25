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
/* eslint-disable no-invalid-this */
const _Services_1 = require("@Services");
if (process.env.TELE_TOKEN) {
    describe.skip('TelegramService', () => {
        it('should send a message', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield _Services_1.TelegramService.sendText(`Unit test: ${new Date()}`);
            });
        });
    });
}

//# sourceMappingURL=TelegramService.test.js.map
