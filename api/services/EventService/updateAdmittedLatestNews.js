
async function updateAdmittedLatestNews(eventId, { transaction }) {
  const latestAdmittedNews = await SeqModels.News.findOne({
    where: {
      eventId,
      status: 'admitted',
    },
    order: [
      ['time', 'DESC'],
    ],
    transaction,
  });
  await SeqModels.Event.update({
    latestAdmittedNewsId: latestAdmittedNews.id,
  }, {
    where: {
      id: eventId,
    },
    transaction,
  });
}

module.exports = updateAdmittedLatestNews;
