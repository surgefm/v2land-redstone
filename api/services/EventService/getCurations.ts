import { TagCuration, sequelize, Sequelize } from '@Models';

const getCurations = async (eventId: number) => {
  return sequelize.query<TagCuration>(`
    SELECT *
    FROM "tagCuration" AS a,
      (SELECT "tagId", MAX("updatedAt") "updatedAt"
      FROM "tagCuration"
      WHERE "eventId" = $1
      GROUP BY "tagId") AS b
    WHERE a."tagId" = b."tagId"
    AND a."updatedAt" = b."updatedAt"
  `, {
    type: Sequelize.QueryTypes.SELECT,
    bind: [eventId],
  });
};

export default getCurations;
