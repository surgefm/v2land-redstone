const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

function tokenGenerator () {
  const token = uuidv4();
  return crypto
    .createHash('sha256')
    .update(token, 'utf8')
    .digest('hex');
}

module.exports = tokenGenerator;
