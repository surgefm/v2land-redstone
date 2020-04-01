import forbiddenRoute from './forbiddenRoute';
import isAdmin from './isAdmin';
import isLoggedIn from './isLoggedIn';
import isManager from './isManager';
import sessionAuth from './sessionAuth';

export type PolicyMiddleware = typeof forbiddenRoute | typeof isAdmin |
  typeof isLoggedIn | typeof isManager | typeof sessionAuth;

export {
  forbiddenRoute,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
};

export default {
  forbiddenRoute,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
} as { [index: string]: PolicyMiddleware };
