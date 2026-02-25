"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateElasticsearchIndex = exports.updateAlgoliaIndex = exports.getContribution = exports.acquireContributionsByNewsList = void 0;
const acquireContributionsByNewsList_1 = __importDefault(require("./acquireContributionsByNewsList"));
exports.acquireContributionsByNewsList = acquireContributionsByNewsList_1.default;
const getContribution_1 = __importDefault(require("./getContribution"));
exports.getContribution = getContribution_1.default;
const updateAlgoliaIndex_1 = __importDefault(require("./updateAlgoliaIndex"));
exports.updateAlgoliaIndex = updateAlgoliaIndex_1.default;
const updateElasticsearchIndex_1 = __importDefault(require("./updateElasticsearchIndex"));
exports.updateElasticsearchIndex = updateElasticsearchIndex_1.default;

//# sourceMappingURL=index.js.map
