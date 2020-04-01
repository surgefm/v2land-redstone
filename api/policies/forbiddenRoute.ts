/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Check if the session client's role is admin
 *                 This policy must be applie only AFTER isLoggedIn policy
 *                 which means the client should have a valid req.currentClient instance
 * @returns     :: '404 该路径并未开放' if route not permitted.
 */
import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';

export default function(req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
  return res.status(404).json({
    message: '该路径并未开放',
  });
};
