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

export const addRoleParents = acl.addRoleParents.bind(acl);
export const addUserRoles = acl.addUserRoles.bind(acl);
export const allow = acl.allow.bind(acl);
export const hasRole = acl.hasRole.bind(acl);
export const isAllowed = acl.isAllowed.bind(acl);
export const removeAllow = acl.removeAllow.bind(acl);
export const removePermissions = acl.removePermissions.bind(acl);
export const removeResource = acl.removeResource.bind(acl);
export const removeRole = acl.removeRole.bind(acl);
export const removeUserRoles = acl.removeUserRoles.bind(acl);
export const userRoles = acl.userRoles.bind(acl);
export const whatResources = acl.whatResources.bind(acl);
