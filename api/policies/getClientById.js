/**
 * getClientById
 *
 * @module      :: Policy
 * @description :: Check if the clientId is undefined or invalid; if valid, return a client instance
 * @returns     :: a client instance(if client's found) or false (if not found)
 */
// console.log('getClientById LOADED');

module.export = async function(clientId) {
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
};
