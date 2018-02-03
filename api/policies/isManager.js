/**
 * isManager
 *
 * @module      :: Policy
 * @description :: Check if the session client's role is manager
 *                 Assuming that the client has already logged in, 
 *                 which means he should have a req.client instance or at least a valid clientId
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
    console.log('req.client = ' + req.client);    
    console.log('req.client.role = ' + req.client.role);
    if(!req.client.role) { // in case the req.client is not working
        
    }
  };
  