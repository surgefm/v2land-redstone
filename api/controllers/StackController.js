/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const StackController = {

  getStack: async(req, res) => {
    const id = req.param('stackId');
    const stack = await StackService.findStack(id);
    if (stack) {
      res.status(200).json({ stack });
    } else {
      res.status(404).json({
        message: '未找到该进展',
      });
    }
  },

};

module.exports = StackController;
