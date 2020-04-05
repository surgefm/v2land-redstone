/**
 * isManager
 *
 * @module      :: Policy
 * @description :: Check if the session client's role is admin or manager
 *                 This policy must be applie only AFTER isLoggedIn policy
 *                 which means the client should have a valid req.currentClient instance
 * @returns     :: '403 您没有权限进行该操作' if unauthorized
 *
 */
import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
export default function(req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
  if (req.currentClient.isManager) {
    next();
  } else {
    return res.status(403).json({
      message: '您没有权限进行该操作',
    });
  }
}
