/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session user has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = async function(req, res, next) {
    console.log('req.session.clientId = ' + req.session.clientId);
    // let valid = ;
    // console.log('valid = ' + valid);
    if (await clientIdIsValid(req.session.clientId)) {
        // console.log('next');
        return next();
    } else {
        // actions if not logged in
        // console.log('forbidden');
        return res.forbidden('You must log in to visit this page.');
    }
};

/**
 * clientIdIsValid
 *
 * @description :: Check if the clientId is undefined or invalid
 */
async function clientIdIsValid(clientId) {
    if (!clientId) {
        // console.log('clientId == false');
        return false;
    }
    let client = await Client.findOne({ id: clientId });
    if (!client) {
        delete req.session.clientId;
        return false;
    }
    // console.log('clientId == true');
    return true;
}
