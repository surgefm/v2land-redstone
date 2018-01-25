/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session user has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

function clientIdIsValid(clientId) {
    if(!clientId) return false;
    let client = Client.findOne({ id: clientId });
    if (!client) {
        delete req.session.clientId;
        return false;
    }
    return true;
}

module.exports = function(req, res, next) {

    // console.log("req.session.clientId = " + req.session.clientId);
    if(clientIdIsValid(req.session.clientId)) {
        return next();
    }
    else { 
        // behaviour if not logged in
        return res.forbidden('You must log in to visit this page.');
    }
};
  