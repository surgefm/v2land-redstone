const SeqModels = require('../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const NewsService = {

  async getContribution(news, withData, { transaction } = {}) {
    const records = await SeqModels.Record.findAll({
      attributes: withData ? undefined : {
        exclude: ['data', 'before'],
      },
      where: {
        action: {
          [Op.or]: ['updateNewsStatus', 'updateNewsDetail', 'createNews'],
        },
        target: news.id,
      },
      include: {
        model: SeqModels.Client,
        as: 'owner',
        required: false,
        attributes: ['username', 'role', 'id'],
      },
      transaction,
    });

    return records;
  },

  async acquireContributionsByNewsList(newsList, withData, { transaction } = {}) {
    const queue = [];

    const getContribution = async (news) => {
      news.contribution = await NewsService.getContribution(news, withData, { transaction });
    };
    for (const news of newsList) {
      queue.push(getContribution(news));
    }

    await Promise.all(queue);
    return newsList;
  },

};

module.exports = NewsService;
