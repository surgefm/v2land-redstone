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
exports.keywordSearch = void 0;
const _Services_1 = require("@Services");
const SearchService_1 = require("../services/SearchService");
function keywordSearch(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyword = req.query.keyword;
        if (!keyword) {
            return res.status(400).json({
                message: 'Missing parameter: keyword.',
            });
        }
        const searchType = req.query.search_type;
        if (searchType !== undefined && !Object.values(SearchService_1.SearchType).includes(searchType)) {
            return res.status(500).json({
                message: 'Wrong parameter: search_type is invalid.',
            });
        }
        const { from, size } = req.query;
        const searchResults = yield _Services_1.SearchService.keywordQueryUsingElasticsearch(keyword, searchType, parseInt(from || '0'), parseInt(size || '20'));
        return res.status(200).json({
            results: searchResults,
        });
    });
}
exports.keywordSearch = keywordSearch;

//# sourceMappingURL=SearchController.js.map
