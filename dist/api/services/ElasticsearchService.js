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
exports.msearch = exports.bulk = exports.update = exports.search = exports.client = void 0;
/* eslint-disable camelcase */
const elasticsearch_1 = __importDefault(require("@elastic/elasticsearch"));
const url = process.env.ES_URL;
exports.client = url ? new elasticsearch_1.default.Client({ node: url }) : null;
function search(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return exports.client ? exports.client.search(query) : null;
    });
}
exports.search = search;
function update(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return exports.client ? exports.client.update(query) : null;
    });
}
exports.update = update;
function bulk(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!exports.client)
                return resolve(null);
            exports.client.bulk(query, (err, res) => {
                if (err)
                    return reject(err);
                resolve(res);
            });
        });
    });
}
exports.bulk = bulk;
function msearch(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return exports.client ? exports.client.msearch(query) : null;
    });
}
exports.msearch = msearch;
exports.default = {
    search,
    update,
    bulk,
    msearch,
};

//# sourceMappingURL=ElasticsearchService.js.map
