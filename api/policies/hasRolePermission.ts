import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService } from '@Services';

const hasRolePermission = (action: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) {
    return res.status(400).json({
      message: '客户端id不是数字',
    });
  }
  const resource = AccessControlService.getRoleEditRolePlain(clientId);
  let haveAccess = await AccessControlService.isAllowed(clientId, resource, action);
  if (haveAccess) return next();

  const isRequestingAdmin = await AccessControlService.isClientAdmin(clientId);
  haveAccess = isRequestingAdmin
    ? await AccessControlService.isAllowed(clientId, 'admin-roles', action)
    : await AccessControlService.isAllowed(clientId, 'non-admin-roles', action);
  if (haveAccess) return next();
  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasRolePermission;
