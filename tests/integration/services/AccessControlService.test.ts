/* eslint-disable no-invalid-this */
import assert from 'assert';
import { AccessControlService } from '@Services';

const removeAllRoles = async (clientId: number) => {
  return AccessControlService.removeUserRoles(clientId, await AccessControlService.userRoles(clientId));
};

describe('AccessControlService', () => {
  it('should initialize', async function() {
    await AccessControlService.initialize();
  });

  it('should allow contributors to create event', async function() {
    await removeAllRoles(-1);
    await AccessControlService.addUserRoles(-1, AccessControlService.roles.contributors);
    const isAllowed = await AccessControlService.isAllowed(-1, 'events', 'create');
    assert(isAllowed === true);
  });

  it('should allow editors to create event', async function() {
    await removeAllRoles(-1);
    await AccessControlService.addUserRoles(-1, AccessControlService.roles.editors);
    const isAllowed = await AccessControlService.isAllowed(-1, 'events', 'create');
    assert(isAllowed === true);
  });

  it('should allow admins to create event', async function() {
    await removeAllRoles(-1);
    await AccessControlService.addUserRoles(-1, AccessControlService.roles.admins);
    const isAllowed = await AccessControlService.isAllowed(-1, 'events', 'create');
    assert(isAllowed === true);
  });

  it('should not allow guests to create event', async function() {
    await removeAllRoles(-1);
    await AccessControlService.addUserRoles(-1, AccessControlService.roles.guests);
    const isAllowed = await AccessControlService.isAllowed(-1, 'events', 'create');
    assert(isAllowed === false);
  });
});
