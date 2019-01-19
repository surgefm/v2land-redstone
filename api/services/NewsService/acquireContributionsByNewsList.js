async function acquireContributionsByNewsList (newsList, withData, { transaction } = {}) {
  const queue = [];

  const getContribution = async (news) => {
    news.contribution = await NewsService.getContribution(news, withData, { transaction });
  };
  for (const news of newsList) {
    queue.push(getContribution(news));
  }

  await Promise.all(queue);
  return newsList;
}

module.exports = acquireContributionsByNewsList;
