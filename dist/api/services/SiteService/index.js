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
exports.ensureAllNewsHaveSiteIcons = exports.findOrCreateBySourceName = void 0;
const _Models_1 = require("@Models");
const UploadService_1 = require("@Services/UploadService");
const sequelize_1 = require("sequelize");
function findOrCreateBySourceName(sourceName, articleUrl) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceName)
            return null;
        const existing = yield _Models_1.Site.findOne({
            where: _Models_1.Sequelize.where(_Models_1.Sequelize.fn('lower', _Models_1.Sequelize.col('name')), sourceName.toLowerCase().trim()),
        });
        if (existing) {
            // Backfill icon if site exists but has no icon yet
            if (!existing.icon && UploadService_1.hasS3) {
                try {
                    const domain = ((_a = existing.domains) === null || _a === void 0 ? void 0 : _a[0]) || new URL(articleUrl).hostname.replace(/^www\./, '');
                    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                    const icon = yield (0, UploadService_1.uploadFromUrl)(faviconUrl, '.png');
                    if (icon)
                        yield existing.update({ icon });
                }
                catch (e) {
                    console.warn(`SiteService: icon backfill failed for "${existing.name}":`, e.message);
                }
            }
            return existing;
        }
        let homepage;
        let icon;
        let domain;
        try {
            const url = new URL(articleUrl);
            homepage = url.origin;
            domain = url.hostname.replace(/^www\./, '');
            if (UploadService_1.hasS3) {
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                icon = yield (0, UploadService_1.uploadFromUrl)(faviconUrl, '.png');
            }
        }
        catch (e) {
            console.warn(`SiteService: failed to process URL or fetch icon for "${sourceName}":`, e.message);
        }
        const site = yield _Models_1.Site.create({
            name: sourceName.trim(),
            domains: domain ? [domain] : [],
            homepage,
            icon,
        });
        return site;
    });
}
exports.findOrCreateBySourceName = findOrCreateBySourceName;
function backfillNewsList(newsList, label) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        for (const news of newsList) {
            try {
                const site = yield findOrCreateBySourceName(news.source, news.url);
                if (site) {
                    yield news.update({ siteId: site.id });
                    count++;
                }
            }
            catch (e) {
                console.warn(`SiteService: failed to backfill news ${news.id}:`, e.message);
            }
        }
        if (count > 0) {
            console.log(`SiteService: backfilled ${count} ${label} news items`);
        }
        return count;
    });
}
function ensureAllNewsHaveSiteIcons() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const noSiteCondition = {
            siteId: { [sequelize_1.Op.is]: null },
            source: { [sequelize_1.Op.and]: [{ [sequelize_1.Op.ne]: null }, { [sequelize_1.Op.ne]: '' }] },
        };
        // Phase 1: news currently in stacks (visible in timelines)
        const inStackNewsIds = yield _Models_1.EventStackNews.findAll({
            where: { stackId: { [sequelize_1.Op.ne]: null } },
            attributes: ['newsId'],
            group: ['newsId'],
        });
        const stackNewsIdSet = new Set(inStackNewsIds.map((esn) => esn.newsId));
        if (stackNewsIdSet.size > 0) {
            const inStackNews = yield _Models_1.News.findAll({
                where: Object.assign(Object.assign({}, noSiteCondition), { id: { [sequelize_1.Op.in]: [...stackNewsIdSet] } }),
            });
            if (inStackNews.length > 0) {
                console.log(`SiteService: backfilling ${inStackNews.length} in-stack news first...`);
                yield backfillNewsList(inStackNews, 'in-stack');
            }
        }
        // Phase 2: remaining news (off-shelf, orphaned, etc.)
        const remainingNews = yield _Models_1.News.findAll({ where: noSiteCondition });
        if (remainingNews.length > 0) {
            console.log(`SiteService: backfilling ${remainingNews.length} remaining news...`);
            yield backfillNewsList(remainingNews, 'remaining');
        }
        // Phase 3: fill icons for sites that were created without S3
        if (UploadService_1.hasS3) {
            const sitesWithoutIcons = yield _Models_1.Site.findAll({
                where: { icon: { [sequelize_1.Op.is]: null } },
            });
            if (sitesWithoutIcons.length > 0) {
                console.log(`SiteService: fetching icons for ${sitesWithoutIcons.length} sites...`);
                for (const site of sitesWithoutIcons) {
                    try {
                        const domain = ((_a = site.domains) === null || _a === void 0 ? void 0 : _a[0]) || (site.homepage ? new URL(site.homepage).hostname.replace(/^www\./, '') : null);
                        if (!domain)
                            continue;
                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                        const icon = yield (0, UploadService_1.uploadFromUrl)(faviconUrl, '.png');
                        if (icon)
                            yield site.update({ icon });
                    }
                    catch (e) {
                        console.warn(`SiteService: failed to fetch icon for site ${site.id} (${site.name}):`, e.message);
                    }
                }
                console.log('SiteService: site icon fetch complete');
            }
        }
        console.log('SiteService: backfill complete');
    });
}
exports.ensureAllNewsHaveSiteIcons = ensureAllNewsHaveSiteIcons;

//# sourceMappingURL=index.js.map
