/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash');

const StackController = {

  getStack: async (req, res) => {
    const id = req.param('stackId');
    const stack = await StackService.findStack(id);
    if (stack) {
      if (stack.status !== 'admitted') {
        if (req.session.clientId) {
          client = await Client.findOne({ id: req.session.clientId });
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
    } else if (req.query && req.query.where) {
      where = req.query.where;
    }

    if (where) {
      try {
        where = JSON.parse(where);
      } catch (err) {/* happy */}
    }

    if (where && req.session.clientId) {
      const client = await Client.findOne({
        id: req.session.clientId,
      });
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    const stacks = await Stack.find({
      where: where || {
        status: 'admitted',
      },
      sort: 'updatedAt DESC',
    });

    res.status(200).json({
      stackList: stacks,
    });
  },

  updateStack: async (req, res) => {
    const id = req.param('stackId');
    const data = req.body;

    const cb = await StackService.updateStack(id, data, req.session.clientId);
    if (cb.error) {
      return res.serverError(cb.error);
    } else {
      return res.status(cb.status).json(cb.message);
    }
  },

  updateMultipleStacks: async (req, res) => {
    const { data } = req;
    const { stackList } = data;

    if (!_.isArray(stackList)) {
      return res.status(400).json({
        message: '错误的输入参数：stackList',
      });
    }

    const queue = [];
    for (const stack of stackList) {
      queue.push(StackService.updateStack(stack.id, stack, req.session.clientId));
    }

    try {
      await Promise.all(queue);
      return res.status(201).json({
        message: '修改成功',
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

module.exports = StackController;
