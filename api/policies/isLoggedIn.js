/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session user has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = async function(req, res, next) {
    // console.log('getClientById = ' + getClientById);
    // console.log('req.session.clientId = ' + req.session.clientId);
    // console.log('req.session.client = ' + req.session.client);
    let client = await getClientById(req.session.clientId);
    // console.log('client = ' + client);
    if (client) {
        // console.log('next');
        req.session.client = client;
        return next();
    } else {
        // actions if not logged in
        // console.log('forbidden');
        return res.status(401).json({
            message: '你还未登录哦',
        });
    }
};

/**
 * getClientById
 *
 * @module      :: Policy
 * @description :: Check if the clientId is undefined or invalid; if valid, return a client instance
 * @returns     :: a client instance(if client's found) or false (if not found)
 */
async function getClientById(clientId) {
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
    return client;
}
