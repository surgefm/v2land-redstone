import { Event } from '@Models';
import { Transaction } from 'sequelize';

async function updateAdmittedLatestNews(eventId: number, { transaction }: {
  transaction?: Transaction;
}) {
  const event = await Event.findByPk(eventId);
  const latestAdmittedNews = await event.$get('news', {
    where: { status: 'admitted' },
    order: [['time', 'DESC']],
    transaction,
  });
  if (latestAdmittedNews.length === 0) return;
  event.latestAdmittedNewsId = latestAdmittedNews[0].id;
  await event.save({ transaction });
}

export default updateAdmittedLatestNews;
