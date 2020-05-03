import acl from './acl';

type strings = string | string[];

export async function areAnyRolesAllowed(roles: strings, resources: strings, permissions: strings) {
  return new Promise<boolean>((resolve, reject) => {
    acl.areAnyRolesAllowed(roles, resources, permissions, (err, allowed) => {
      if (err) return reject(err);
      resolve(allowed);
    });
  });
}

export async function roleUsers(role: string) {
  return new Promise<string[]>((resolve, reject) => {
    acl.roleUsers(role, (err, users: string[]) => {
      if (err) return reject(err);
      resolve(users);
    });
  });
}

export const addRoleParents: typeof acl.addRoleParents = acl.addRoleParents.bind(acl);
export const addUserRoles: typeof acl.addUserRoles = acl.addUserRoles.bind(acl);
export const allow: typeof acl.allow = acl.allow.bind(acl);
export const hasRole: typeof acl.hasRole = acl.hasRole.bind(acl);
export const isAllowed: typeof acl.isAllowed = acl.isAllowed.bind(acl);
export const removeAllow: typeof acl.removeAllow = acl.removeAllow.bind(acl);
export const removePermissions: typeof acl.removePermissions = acl.removePermissions.bind(acl);
export const removeResource: typeof acl.removeResource = acl.removeResource.bind(acl);
export const removeRole: typeof acl.removeRole = acl.removeRole.bind(acl);
export const removeUserRoles: typeof acl.removeUserRoles = acl.removeUserRoles.bind(acl);
export const userRoles: typeof acl.userRoles = acl.userRoles.bind(acl);
export const whatResources: typeof acl.whatResources = acl.whatResources.bind(acl);
