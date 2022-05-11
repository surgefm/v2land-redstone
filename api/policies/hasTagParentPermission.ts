import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService } from '@Services';
import { Tag } from '@Models';

const hasTagParentPermission = (action: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  if (await AccessControlService.isAllowed(req.session.clientId, 'all-tags', action)) return next();
  const tagId = +req.params.tagId;
  const tag = await Tag.findByPk(tagId);
  let haveAccess = true;
  if (!tag.parentId) haveAccess = false;
  if (haveAccess) {
    const resource = AccessControlService.getTagResourceId(tag.parentId);
    haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, action);
  }
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasTagParentPermission;
