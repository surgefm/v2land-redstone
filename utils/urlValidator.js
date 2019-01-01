const validator = require('validator');

module.exports = (url) => validator.isURL(url, {
  protocols: ['http', 'https'],
  require_protocol: true,
});
