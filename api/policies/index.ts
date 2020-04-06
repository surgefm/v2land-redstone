import forbiddenRoute from './forbiddenRoute';
import isAdmin from './isAdmin';
import isLoggedIn from './isLoggedIn';
import isManager from './isManager';
import sessionAuth from './sessionAuth';
import uploadFile from './uploadFile';

export type PolicyMiddleware = typeof forbiddenRoute | typeof isAdmin |
  typeof isLoggedIn | typeof isManager | typeof sessionAuth | typeof uploadFile;

export {
  forbiddenRoute,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
  uploadFile,
};

export default {
  forbiddenRoute,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
  uploadFile,
} as { [index: string]: PolicyMiddleware };
