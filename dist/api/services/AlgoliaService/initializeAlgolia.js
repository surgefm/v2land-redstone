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
exports.initializeAlgolia = void 0;
const _Models_1 = require("@Models");
const EventService_1 = require("../EventService");
const NewsService_1 = require("../NewsService");
const TagService_1 = require("../TagService");
const ClientService_1 = require("../ClientService");
const StackService_1 = require("../StackService");
const index_1 = require("./index");
const initializeAlgolia = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield _Models_1.Event.findAll();
        for (const event of events) {
            yield (0, EventService_1.updateAlgoliaIndex)({ event });
        }
        const news = yield _Models_1.News.findAll();
        for (const n of news) {
            yield (0, NewsService_1.updateAlgoliaIndex)({ news: n });
        }
        const stacks = yield _Models_1.Stack.findAll();
        for (const stack of stacks) {
            yield (0, StackService_1.updateAlgoliaIndex)({ stack });
        }
        const clients = yield _Models_1.Client.findAll();
        for (const client of clients) {
            yield (0, ClientService_1.updateAlgoliaIndex)({ client });
        }
        const tags = yield _Models_1.Tag.findAll();
        for (const tag of tags) {
            yield (0, TagService_1.updateAlgoliaIndex)({ tag });
        }
        const sites = yield _Models_1.Site.findAll();
        yield (0, index_1.updateSite)(sites);
    }
    catch (err) {
        console.log(err);
    }
});
exports.initializeAlgolia = initializeAlgolia;

//# sourceMappingURL=initializeAlgolia.js.map
