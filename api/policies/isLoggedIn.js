/**
 * isLoggedIn
 *
 * @module      :: Policy
 * @description :: Check if the session client has logged in
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

module.exports = async function(req, res, next) {
    sails.log.info('req.session.clientId = '+req.session.clientId);
    const client = await getClient(req.session.clientId);
    sails.log.info('client = '+client);    
    
    return res.status(401).json({
       message: req.session.clientId + '/' + client,
    });
    if (client) {
        req.client = client;
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
async function getClient(clientId) {
    if (!clientId) {
        return false;
    }
    const client = await Client.findOne({ id: clientId });
    if (!client) {
        delete req.session.clientId;
        return false;
    }
    return client;
}
