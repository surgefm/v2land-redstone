import { Transaction } from 'sequelize';
import { sequelize, Event, HeaderImage, Sequelize } from '@Models';

async function getEventsClientContributedTo(clientId: number, { transaction }: { transaction?: Transaction } = {}) {
  const events = await sequelize.query<Event>(`
    SELECT *
    FROM event
    WHERE
        event.status = 'admitted' AND
      ("ownerId" = ${clientId} OR
      (event.id in (
        SELECT DISTINCT ON ("eventId") "eventId"
        FROM public."eventContributor"
        WHERE "contributorId" = ${clientId}
        ORDER BY "eventId", "createdAt" DESC
      )))
    ORDER BY event."updatedAt" DESC
  `, {
    transaction,
    type: Sequelize.QueryTypes.SELECT,
  });

  await Promise.all(events.map(async e => {
    e.headerImage = await HeaderImage.findOne({ where: { eventId: e.id }, transaction });
  }));

  return events;
}

export default getEventsClientContributedTo;

