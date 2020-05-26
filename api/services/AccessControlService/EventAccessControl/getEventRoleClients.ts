import { roleUsers } from '@Services/AccessControlService/operations';
import {
  getEventOwnerRolePlain,
  getEventManageRolePlain,
  getEventEditRolePlain,
  getEventViewRolePlain,
} from './getEventRoles';

async function getEventRoleClients(eventId: number, role: 'owner' | 'manager' | 'editor' | 'viewer') {
  switch (role) {
  case 'owner':
    return (await roleUsers(getEventOwnerRolePlain(eventId))).map(i => +i);
  case 'manager':
    return (await roleUsers(getEventManageRolePlain(eventId))).map(i => +i);
  case 'editor':
    return (await roleUsers(getEventEditRolePlain(eventId))).map(i => +i);
  case 'viewer':
    return (await roleUsers(getEventViewRolePlain(eventId))).map(i => +i);
  default:
    return [];
  }
}

export default getEventRoleClients;
