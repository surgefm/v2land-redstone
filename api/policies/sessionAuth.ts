/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 *
 */
import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';

export default function(req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) {
  // User is allowed, proceed to the next policy,
  // or if this is the last policy, the controller
  if (req.session.authenticated) {
    return next();
  }

  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)
  return res.status(403).json({ message: 'You are not permitted to perform this action.' });
};
