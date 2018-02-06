/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Check if the session client's role is admin
 *                 This policy must be applie only AFTER isLoggedIn policy
 *                 which means the client should have a valid req.currentClient instance
 * @returns     :: '403 您没有权限进行该操作' if unauthorized
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
  if (req.currentClient.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      message: '您没有权限进行该操作',
    });
  }
};
