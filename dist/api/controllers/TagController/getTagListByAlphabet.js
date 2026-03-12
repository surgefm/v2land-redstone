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
const getTags = (letter) => __awaiter(void 0, void 0, void 0, function* () {
    const key = `tag-list-alphabet-${letter}-60`;
    const existing = yield _Services_1.RedisService.get(key);
    if (existing)
        return existing;
    const tags = yield _Models_1.sequelize.query(`
    SELECT * FROM tag
    WHERE status = 'visible'
      AND slug LIKE '${letter}%'
      AND EXISTS(
        SELECT 1
          FROM "eventTag", event, tag as t
         WHERE t."hierarchyPath" @> tag."hierarchyPath"
           AND t.id = "eventTag"."tagId"
           AND "eventTag"."eventId" = event.id
           AND event.status = 'admitted'
      )
  `, {
        type: _Models_1.Sequelize.QueryTypes.SELECT,
    });
    yield _Services_1.RedisService.set(key, tags);
    yield _Services_1.RedisService.expire(key, 60);
    return tags;
});
function getTagListByAlphabet(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { alphabet } = _Services_1.UtilService;
        const { letter } = req.params;
        if (!alphabet.includes(letter) && letter !== 'all') {
            return res.status(400).json({ message: 'Invalid input' });
        }
        if (letter === 'all') {
            const allTags = {};
            yield Promise.all(alphabet.map((letter) => __awaiter(this, void 0, void 0, function* () {
                allTags[letter] = yield getTags(letter);
            })));
            return res.status(200).json({ allTags });
        }
        const tags = yield getTags(letter);
        return res.status(200).json({ tags });
    });
}
exports.default = getTagListByAlphabet;

//# sourceMappingURL=getTagListByAlphabet.js.map
