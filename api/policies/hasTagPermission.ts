import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService } from '@Services';

const hasTagPermission = (action: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  if (await AccessControlService.isAllowed(req.session.clientId, 'all-tags', action)) return next();
  const tagId = +req.params.tagId;
  const resource = AccessControlService.getTagResourceId(tagId);
  const haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, action);
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasTagPermission;
