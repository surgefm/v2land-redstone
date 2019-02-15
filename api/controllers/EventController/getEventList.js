const SeqModels = require('../../../seqModels');
const _ = require('lodash');

async function getEventList (req, res) {
  let page;
  let where;
  let mode; // 0: latest updated; 1:
  let isManager = false;

  switch (req.method) {
  case 'GET':
    page = req.query.page;
    // 0: oldest event first (by first stack);
    // 1: newest event first (by latest news)
    mode = req.query.mode;
    if (req.query.where && typeof req.query.where === 'string') {
      where = JSON.parse(where);
    } else if (req.query.status) {
      where = {
        status: req.query.status,
      };
    }
    break;
  case 'POST':
    // 兼容古老代码 POST 方法
    page = req.body.page;
    where = req.body.where;
    mode = req.body.mode;
    break;
  }

  page = UtilService.validateNumber(page, 1);
  mode = UtilService.validateNumber(mode, 0);

  if (_.isUndefined(page)) {
    return res.status(400).json({
      message: '参数有误：page',
    });
  }

  if (_.isUndefined(mode)) {
    return res.status(400).json({
      message: '参数有误：mode',
    });
  }

  try {
    await sequelize.transaction(async transaction => {
      if (where && req.session && req.session.clientId) {
        const client = await SeqModels.Client.findOne({
          where: { id: req.session.clientId },
          transaction,
        });

        if (client && ['manager', 'admin'].includes(client.role)) {
          isManager = true;
        }
      }

      if (where && !isManager) {
        where.status = 'admitted';
      }

      if (where) {
        where = UtilService.convertWhereQuery(where);
      }

      let events = await SeqModels.Event.findAll({
        where,
        include: [{
          as: 'headerImage',
          model: SeqModels.HeaderImage,
          required: false,
        }],
        order: [['updatedAt', 'DESC']],
        transaction,
      });

      events = events.map(e => e.toJSON());

      await EventService.acquireContributionsByEventList(events);

      res.status(200).json({ eventList: events });
    });
  } catch (err) {
    console.log(err);
    return res.serverError(err);
  }
}

module.exports = getEventList;
