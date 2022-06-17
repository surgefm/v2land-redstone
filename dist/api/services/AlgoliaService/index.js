"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.deleteStack = exports.deleteSite = exports.deleteClient = exports.deleteTag = exports.deleteEvent = exports.deleteNews = exports.updateStack = exports.updateSite = exports.updateClient = exports.updateTag = exports.updateEvent = exports.updateNews = exports.addStack = exports.addSite = exports.addClient = exports.addTag = exports.addEvent = exports.addNews = exports.searchStacks = exports.searchSites = exports.searchClients = exports.searchTags = exports.searchEvents = exports.searchNews = exports.search = exports.stackIndex = exports.siteIndex = exports.tagIndex = exports.clientIndex = exports.eventIndex = exports.newsIndex = exports.client = void 0;
const algoliasearch_1 = __importDefault(require("algoliasearch"));
const ClientService = __importStar(require("../ClientService"));
const useAlgolia = process.env.ALGOLIA_APPID && process.env.ALGOLIA_API_KEY;
exports.client = (0, algoliasearch_1.default)(process.env.ALGOLIA_APPID, process.env.ALGOLIA_API_KEY);
exports.newsIndex = exports.client.initIndex('news');
exports.eventIndex = exports.client.initIndex('events');
exports.clientIndex = exports.client.initIndex('clients');
exports.tagIndex = exports.client.initIndex('tags');
exports.siteIndex = exports.client.initIndex('sites');
exports.stackIndex = exports.client.initIndex('stacks');
const search = (query, page = 1, indices = ['events', 'tags', 'clients']) => __awaiter(void 0, void 0, void 0, function* () {
    if (!useAlgolia)
        return [];
    const queries = indices.map(index => ({
        indexName: index,
        query,
        params: { page },
    }));
    const { results } = yield exports.client.multipleQueries(queries);
    return results;
});
exports.search = search;
const searchIndex = (index) => (query, page = 1) => __awaiter(void 0, void 0, void 0, function* () {
    if (!useAlgolia)
        return [];
    const { hits } = yield index.search(query, { page });
    return hits;
});
const getPlainHelper = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(object => getPlain(object));
    }
    if (typeof obj.get === 'function') {
        obj = obj.get({ plain: true });
    }
    if (typeof obj.objectID === 'undefined') {
        obj.objectID = obj.id;
    }
    return obj;
};
function getPlain(objects, preprocess = a => a) {
    return preprocess(getPlainHelper(objects));
}
function getPlains(objects, preprocess = a => a) {
    return getPlainHelper(objects).map(preprocess);
}
const add = (index, preprocess = a => a) => {
    function addUtil(objects) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!useAlgolia)
                return;
            if (Array.isArray(objects)) {
                const { objectIDs } = yield index.saveObjects(getPlains(objects, preprocess));
                return objectIDs;
            }
            const { objectID } = yield index.saveObject(getPlain(objects, preprocess));
            return objectID;
        });
    }
    return addUtil;
};
const update = (index, preprocess = a => a) => {
    function updateUtil(objects) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!useAlgolia)
                return;
            if (Array.isArray(objects)) {
                const { objectIDs } = yield index.partialUpdateObjects(getPlains(objects, preprocess), {
                    createIfNotExists: true,
                });
                return objectIDs;
            }
            const { objectID } = yield index.partialUpdateObject(getPlain(objects, preprocess), {
                createIfNotExists: true,
            });
            return objectID;
        });
    }
    return updateUtil;
};
const del = (index) => {
    const getId = (object) => {
        if (typeof object === 'number')
            return `${object}`;
        if (typeof object.id === 'undefined')
            return `${object.objectID}`;
        return `${object.id}`;
    };
    function delUtil(objectIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(objectIDs)) {
                return index.deleteObjects(objectIDs.map(getId));
            }
            return index.deleteObject(getId(objectIDs));
        });
    }
    return delUtil;
};
exports.searchNews = searchIndex(exports.newsIndex);
exports.searchEvents = searchIndex(exports.eventIndex);
exports.searchTags = searchIndex(exports.tagIndex);
exports.searchClients = searchIndex(exports.clientIndex);
exports.searchSites = searchIndex(exports.siteIndex);
exports.searchStacks = searchIndex(exports.stackIndex);
exports.addNews = add(exports.newsIndex);
exports.addEvent = add(exports.eventIndex);
exports.addTag = add(exports.tagIndex);
exports.addClient = add(exports.clientIndex, ClientService.sanitizeClient);
exports.addSite = add(exports.siteIndex);
exports.addStack = add(exports.stackIndex);
exports.updateNews = update(exports.newsIndex);
exports.updateEvent = update(exports.eventIndex);
exports.updateTag = update(exports.tagIndex);
exports.updateClient = update(exports.clientIndex, ClientService.sanitizeClient);
exports.updateSite = update(exports.siteIndex);
exports.updateStack = update(exports.stackIndex);
exports.deleteNews = del(exports.newsIndex);
exports.deleteEvent = del(exports.eventIndex);
exports.deleteTag = del(exports.tagIndex);
exports.deleteClient = del(exports.clientIndex);
exports.deleteSite = del(exports.siteIndex);
exports.deleteStack = del(exports.stackIndex);

//# sourceMappingURL=index.js.map
