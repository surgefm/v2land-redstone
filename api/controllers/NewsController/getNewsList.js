const SeqModels = require('../../../seqModels');
const { Op } = require('sequelize');
const _ = require('lodash');

async function getNewsList (req, res) {
  let page = 1;
  let where;
  let withContributionData;
  let isManager = false;

  if (req.body && req.body.page) {
    page = req.body.page;
  } else if (req.query && req.query.page) {
    page = req.query.page;
  }

  if (req.body && req.body.where) {
    where = req.body.where;
  } else if (req.query && req.query.where) {
    where = req.query.where;
  }

  if (req.body && req.body.withContributionData) {
    withContributionData = req.body.withContributionData;
  } else if (req.query && req.query.withContributionData) {
    withContributionData = req.query.withContributionData;
  }

  if (where) {
    try {
      where = JSON.parse(where);
    } catch (err) {/* happy */}
  }

  if (where && req.session.clientId) {
    const client = await SeqModels.Client.findById(req.session.clientId);
    if (client && ['manager', 'admin'].includes(client.role)) {
      isManager = true;
    }
  }

  if (where && !isManager) {
    where.status = 'admitted';
  } else if (where && isManager && _.isArray(where.status)) {
    where.status = { [Op.in]: where.status };
  }

  if (where) {
    try {
      const newsList = await SeqModels.News.findAll({
        where,
        sort: 'updatedAt DESC',
        offset: (page - 1) * 15,
        limit: 15,
      });

      await NewsService.acquireContributionsByNewsList(newsList, withContributionData);

      res.status(200).json({ newsList });
    } catch (err) {
      res.serverError(err);
    }
  } else {
    res.status(400).json({
      message: '缺少参数：where',
    });
  }
}

module.exports = getNewsList;
