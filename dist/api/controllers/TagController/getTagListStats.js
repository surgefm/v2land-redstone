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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function getTagListStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = 'tag-list-stats-60';
        const existing = yield _Services_1.RedisService.get(key);
        if (existing)
            return res.status(200).json({ tagListStats: existing });
        const stats = {};
        const { alphabet } = _Services_1.UtilService;
        const getStat = (letter) => __awaiter(this, void 0, void 0, function* () {
            const count = yield _Models_1.sequelize.query(`
      SELECT COUNT(*) FROM tag
      WHERE status = 'visible'
        AND slug LIKE '${letter}%'
        AND EXISTS(
          SELECT 1
            FROM "eventTag", event
          WHERE tag.id = "eventTag"."tagId" AND "eventTag"."eventId" = event.id AND event.status = 'admitted'
        )
    `, {
                type: _Models_1.Sequelize.QueryTypes.SELECT,
            });
            stats[letter] = +count[0].count;
        });
        yield Promise.all(alphabet.map(getStat));
        yield _Services_1.RedisService.set(key, stats);
        yield _Services_1.RedisService.expire(key, 60);
        return res.status(200).json({ tagListStats: stats });
    });
}
exports.default = getTagListStats;

//# sourceMappingURL=getTagListStats.js.map
