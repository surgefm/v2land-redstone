const implicitGrant = require('./OAuth2Controller/implicitGrant');
const credentialGrant = require('./OAuth2Controller/credentialGrant');

module.exports = {

  grant: async function (req, res) {
    const grantType = req.query['grant_type'];
    switch (grantType) {
    case 'client_credentials':
      return credentialGrant(req, res);
    case 'implicit_grant':
    default:
      return implicitGrant(req, res);
    }
  },

  implicitGrant,

  credentialGrant,

};
