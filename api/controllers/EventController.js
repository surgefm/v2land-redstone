/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getEvent: async (req, res) => {
    let name = req.param('name');
    let event = await Event.findOne({
      or: [
        { id: parseInt(name) > -1 ? parseInt(name) : -1 },
        { name },
      ],
    })
      .populate('news')
      .populate('headerImage');

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: '未找到该事件',
      });
    }
  },
};
