import forbiddenRoute from './forbiddenRoute';
import hasPermission from './hasPermission';
import hasEventPermission from './hasEventPermission';
import hasEventPermissionForSomeStatus from './hasEventPermissionForSomeStatus';
import hasStackPermission from './hasStackPermission';
import isAdmin from './isAdmin';
import isLoggedIn from './isLoggedIn';
import isEditor from './isEditor';
import sessionAuth from './sessionAuth';
import uploadFile from './uploadFile';
import hasRolePermission from './hasRolePermission';

export type PolicyMiddleware = typeof forbiddenRoute | typeof hasPermission | typeof hasEventPermission |
  typeof hasEventPermissionForSomeStatus | typeof isAdmin | typeof isLoggedIn | typeof isEditor |
  typeof sessionAuth | typeof uploadFile | typeof hasRolePermission | typeof hasStackPermission;

export {
  forbiddenRoute,
  hasPermission,
  hasEventPermission,
  hasEventPermissionForSomeStatus,
  hasStackPermission,
  isAdmin,
  isLoggedIn,
  isEditor,
  sessionAuth,
  uploadFile,
  hasRolePermission,
};

export default {
  forbiddenRoute,
  hasPermission,
  hasEventPermission,
  hasEventPermissionForSomeStatus,
  hasStackPermission,
  isAdmin,
  isLoggedIn,
  isEditor,
  sessionAuth,
  uploadFile,
  hasRolePermission,
} as { [index: string]: PolicyMiddleware };
