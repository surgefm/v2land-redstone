import { AccessControlService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';

export default async function checkPermissionOnResource(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = parseInt(req.params.clientId);
  const resourceId = req.params.resourceId;
  const action = req.params.action;
  const haveAccess = await AccessControlService.isAllowed(clientId, resourceId, action);
  return res.status(200).json({
    haveAccess: haveAccess,
  });
}
