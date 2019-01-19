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

async function getEventList ({ mode, page, where, transaction }) {
  mode = Number(mode);
  page = Number(page);

  const events = await global.sequelize.query(Mode1Sql, {
    raw: true,
    transaction,
  });

  return events.toJSON();
}

module.exports = getEventList;
