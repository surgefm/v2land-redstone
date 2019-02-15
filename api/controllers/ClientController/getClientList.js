const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const SeqModels = require('../../../seqModels');

async function getClientList (req, res) {
  let page = 1;
  let where = {};

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

  if (where) {
    try {
      where = JSON.parse(where);
    } catch (err) {/* happy */}

    where = UtilService.convertWhereQuery(where);
  }

  const fetchDetail = async (clients) => {
    const promises = [];
    for (const client of clients) {
      const fetch = async () => {
        client.subscriptionCount = await SeqModels.Subscription.count({
          where: { subscriber: client.id },
        });
      };
      promises.push(fetch());
    }

    await Promise.all(promises);
  };

  const attributes = ['id', 'email', 'username', 'role'];
  const clients = await SeqModels.Client.findAll({
    where: where || {},
    sort: [['updatedAt', 'DESC']],
    attributes,
    offset: (page - 1) * 10,
    limit: 10,
    include: [{
      model: SeqModels.Auth,
      as: 'auths',
      attributes: ['id', 'site', 'profileId', 'profile'],
      where: {
        profileId: {
          [Op.ne]: null,
        },
      },
      required: false,
    }],
  });

  await fetchDetail(clients);

  res.status(200).json({ clientList: clients });
}

module.exports = getClientList;
