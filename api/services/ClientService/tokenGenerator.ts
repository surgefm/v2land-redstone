import uuidv4 from 'uuid/v4';
import * as crypto from 'crypto';

function tokenGenerator () {
  const token = uuidv4();
  return crypto
    .createHash('sha256')
    .update(token, 'utf8')
    .digest('hex');
}

export default tokenGenerator;
