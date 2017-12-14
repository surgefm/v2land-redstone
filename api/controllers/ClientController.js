/**
 * ClientController
 *
 * @description :: Server-side logic for managing clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const bcrypt = require('bcrypt');

module.exports = {

  login: async (req, res) => {
    let data = req.body;

    let user = await Event.findOne({
      username: data.username,
    });

    if (user) {
      if (bcrypt.compareSync(data.password, user.password)) {
        req.session.userId = user.id;

        res.send(200, {
          message: 'Success',
        });
      } else {
        res.send(404, {
          message: 'Invalid password',
        });
      }
    } else {
      res.send(404, {
        message: 'User not found',
      });
    }
  },

};
