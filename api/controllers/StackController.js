/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash');
const SeqModels = require('../../seqModels');

const StackController = {

  getStack: async (req, res) => {
    const id = req.param('stackId');
    const stack = await StackService.findStack(id);
    if (stack) {
      stack.contribution = await StackService.getContribution(id, true);
      if (stack.status !== 'admitted') {
        if (req.session.clientId) {
          client = await SeqModels.Client.findOne({
            where: { id: req.session.clientId },
          });
          if (client && ['manager', 'admin'].includes(client.role)) {
            return res.status(200).json({ stack });
          }
        }
      } else {
        return res.status(200).json({ stack });
      }
    }

    res.status(404).json({
      message: '该进展不存在，或尚未通过审核',
    });
  },

  getStackList: async (req, res) => {
    let where;
    let isManager = false;

    if (req.body && req.body.where) {
      where = req.body.where;
    }

    if (where && req.session.clientId) {
      const client = await SeqModels.Client.findOne({
        where: { id: req.session.clientId },
      });
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    const stacks = await SeqModels.Stack.findAll({
      where: where || {
        status: 'admitted',
      },
      include: [{
        model: SeqModels.News,
        where: { status: 'admitted' },
        order: [['time', 'ASC']],
        required: false,
        limit: 3,
      }],
      order: [['updatedAt', 'DESC']],
    });

    const getDetail = async (stack) => {
      stack = stack.get({ plain: true });
      if (stack.status === 'admitted' && stack.news.length) {
        stack.time = stack.news[0].time;
      }
      stack.newsCount = await SeqModels.News.count({
        where: {
          status: 'admitted',
          stack: stack.id,
        },
      });
    };

    const queue = stacks.map((stack) => getDetail(stack));
    await Promise.all(queue);

    await StackService.acquireContributionsByStackList(stacks);

    res.status(200).json({
      stackList: stacks,
    });
  },

  updateStack: async (req, res) => {
    const id = req.param('stackId');
    const data = req.body;

    try {
      await sequelize.transaction(async transaction => {
        const cb = await StackService.updateStack({
          id,
          data,
          clientId: req.session.clientId,
          transaction,
        });
        return res.status(cb.status).json(cb.message);
      });
    } catch (err) {
      console.error(err);
      return res.serverError(err);
    }
  },

  updateMultipleStacks: async (req, res) => {
    const { stackList } = req.body;

    if (!_.isArray(stackList)) {
      return res.status(400).json({
        message: '错误的输入参数：stackList',
      });
    }

    try {
      await sequelize.transaction(async transaction => {
        const queue = stackList.map(stack => StackService.updateStack({
          id: stack.id,
          data: stack,
          clientId: req.session.clientId,
          transaction,
        }));
        await Promise.all(queue);
        return res.status(201).json({
          message: '修改成功',
        });
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

module.exports = StackController;
