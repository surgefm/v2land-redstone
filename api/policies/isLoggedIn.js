/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session client has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

const SeqModels = require('../../seqModels');

module.exports = async function(req, res, next) {
  if (typeof req.session === 'undefined') {
    return res.status(401).json({
      message: '请在登录后进行该操作',
    });
  }
  req.currentClient = await getClient(req, req.session.clientId);
  if (req.currentClient) {
    req.currentClient.isManager = ['manager', 'admin'].includes(req.currentClient.role);
    req.currentClient.isAdmin = req.currentClient.role === 'admin';
    return next();
  } else {
    return res.status(401).json({
      message: '请在登录后进行该操作',
    });
  }
};

/**
 * getClient
 *
 * @module      :: Policy
 * @description :: Check if the clientId is undefined or invalid; if valid, return a client instance
 * @returns     :: a client instance(if client's found) or false (if not found)
 */
async function getClient(req, clientId) {
  if (!clientId) {
    return false;
  }
  const client = await SeqModels.Client.findByPk(clientId);
  if (!client) {
    delete req.session.clientId;
    return false;
  }
  return client;
}
