import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Client, News } from '@Models';
import { UtilService, NewsService } from '@Services';

async function getNewsList (req: RedstoneRequest, res: RedstoneResponse) {
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
    const client = await Client.findByPk(req.session.clientId);
    if (client && ['manager', 'admin'].includes(client.role)) {
      isManager = true;
    }
  }

  if (where && !isManager) {
    where.status = 'admitted';
  }

  if (where) {
    where = UtilService.convertWhereQuery(where);
    const newsList = await News.findAll({
      where,
      order: [['updatedAt', 'DESC']],
      offset: (page - 1) * 15,
      limit: 15,
    });

    await NewsService.acquireContributionsByNewsList(newsList, withContributionData);

    res.status(200).json({ newsList });
  } else {
    res.status(400).json({
      message: '缺少参数：where',
    });
  }
}

export default getNewsList;
