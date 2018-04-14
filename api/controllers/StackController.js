/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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

};

module.exports = StackController;
