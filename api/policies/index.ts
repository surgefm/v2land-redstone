import forbiddenRoute from './forbiddenRoute';
import hasPermission from './hasPermission';
import hasEventPermission from './hasEventPermission';
import hasEventPermissionForSomeStatus from './hasEventPermissionForSomeStatus';
import isAdmin from './isAdmin';
import isLoggedIn from './isLoggedIn';
import isManager from './isManager';
import sessionAuth from './sessionAuth';
import uploadFile from './uploadFile';
import hasRolePermission from './hasRolePermission';

export type PolicyMiddleware = typeof forbiddenRoute | typeof hasPermission | typeof hasEventPermission |
  typeof hasEventPermissionForSomeStatus | typeof isAdmin | typeof isLoggedIn | typeof isManager |
  typeof sessionAuth | typeof uploadFile | typeof hasRolePermission;

export {
  forbiddenRoute,
  hasPermission,
  hasEventPermission,
  hasEventPermissionForSomeStatus,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
  uploadFile,
  hasRolePermission,
};

export default {
  forbiddenRoute,
  hasPermission,
  hasEventPermission,
  hasEventPermissionForSomeStatus,
  isAdmin,
  isLoggedIn,
  isManager,
  sessionAuth,
  uploadFile,
  hasRolePermission,
} as { [index: string]: PolicyMiddleware };
