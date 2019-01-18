/**
 * ClientController
 *
 * @description :: Server-side logic for managing clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {

  inviteCode: require('./ClientController/inviteCode'),

  login: require('./ClientController/login'),

  logout: require('./ClientController/logout'),

  register: require('./ClientController/register'),

  changePassword: require('./ClientController/changePassword'),

  updateRole: require('./ClientController/updateRole'),

  updateSettings: require('./ClientController/updateSettings'),

  updateClient: require('./ClientController/updateClient'),

  verifyToken: require('./ClientController/verifyToken'),

  findClient: require('./ClientController/findClient'),

  getClientList: require('./ClientController/getClientList'),

  getClientDetail: require('./ClientController/getClientDetail'),

};
