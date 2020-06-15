import { Transaction } from 'sequelize';
import { sequelize, EventContributor, Sequelize } from '@Models';

async function getContributors(eventId: number, { transaction }: { transaction?: Transaction } = {}) {
  return sequelize.query<EventContributor>(`
    SELECT DISTINCT ON ("contributorId") "contributorId", *
    FROM public."eventContributor"
    WHERE "eventId" = ${eventId}
    ORDER BY "contributorId", "createdAt" DESC
  `, {
    transaction,
    type: Sequelize.QueryTypes.SELECT,
  });
}

export default getContributors;
