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

    let user = await Client.findOne({
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

  logout: (req, res) => {
    delete req.session.userId;

    res.send(200, {
      message: 'Success',
    });
  },

  register: (req, res) => {
    let data = req.body;

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        res.send(500, {
          message: 'Error occurs when generateing salt',
        });
      }

      bcrypt.hash(data.password, salt, (err, hash) => {
        Client.create({
          username: data.username,
          password: hash,
        }).exec((err, finn) => {
          if (err) {
            return res.serverError(err);
          }

          return res.ok();
        });
      });
    });
  },

};
