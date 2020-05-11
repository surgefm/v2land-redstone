import { AccessControlService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';

export default async function getClientRoles(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = parseInt(req.params.clientId);
  const roles = await AccessControlService.userRoles(clientId);
  return res.status(200).json(roles);
}
