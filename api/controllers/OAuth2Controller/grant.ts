import { RedstoneRequest, RedstoneResponse } from '@Types';
import credentialGrant from './credentialGrant';
import implicitGrant from './implicitGrant';

async function grant (req: RedstoneRequest, res: RedstoneResponse) {
  const grantType = req.query.grant_type;
  switch (grantType) {
  case 'client_credentials':
    return credentialGrant(req, res);
  case 'implicit_grant':
  default:
    return implicitGrant(req, res);
  }
}

export default grant;
