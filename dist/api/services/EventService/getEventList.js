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
const Mode1Sql = `
WITH MATCH AS (
    SELECT
        event.id id
    FROM
        "public"."event"
    LEFT JOIN "public"."stack" ON event.id = stack.event

    AND stack.status = 'admitted'
GROUP BY
    event.id
ORDER BY
    min(stack. "updatedAt") ASC
)
SELECT
    "event"."name",
    "event"."pinyin",
    "event"."description",
    "event"."status",
    "event"."id",
    "event"."createdAt",
    "event"."updatedAt",
    "headerImage"."imageUrl" AS "headerImage.imageUrl",
    "headerImage"."source" AS "headerImage.source",
    "headerImage"."sourceUrl" AS "headerImage.sourceUrl",
    "headerImage"."id" AS "headerImage.id",
    "headerImage"."createdAt" AS "headerImage.createdAt",
    "headerImage"."updatedAt" AS "headerImage.updatedAt",
    "headerImage"."event" AS "headerImage.event"
FROM
    "public"."event"
    RIGHT JOIN MATCH ON "event".id = MATCH.id
    LEFT OUTER JOIN "public"."headerimage" AS "headerImage" ON "event"."id" = "headerImage"."eventId"
WHERE
    "event"."id" IN (
        SELECT
            id
        FROM
            MATCH) OFFSET 0
    LIMIT 10
`;
function getEventList({ mode, page, where, transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        mode = Number(mode);
        page = Number(page);
        const [events] = yield _Models_1.sequelize.query(Mode1Sql, {
            raw: true,
            transaction,
        });
        return events;
    });
}
exports.default = getEventList;

//# sourceMappingURL=getEventList.js.map
