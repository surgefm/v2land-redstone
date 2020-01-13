import { News, Event } from '@Models';
import { Transaction } from 'sequelize';

async function updateAdmittedLatestNews(eventId: number, { transaction }: {
  transaction?: Transaction;
}) {
  const latestAdmittedNews = await News.findOne({
    where: {
      eventId,
      status: 'admitted',
    },
    order: [
      ['time', 'DESC'],
    ],
    transaction,
  });
  if (!latestAdmittedNews) return;
  return Event.update({
    latestAdmittedNewsId: latestAdmittedNews.id,
  }, {
    where: {
      id: eventId,
    },
    transaction,
  });
}

export default updateAdmittedLatestNews;
