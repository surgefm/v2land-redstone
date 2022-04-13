import getEventRoleClients from './getEventRoleClients';

async function getEventClients(eventId: number) {
  const [owners, managers, editors, viewers] = await Promise.all([
    getEventRoleClients(eventId, 'owner'),
    getEventRoleClients(eventId, 'manager'),
    getEventRoleClients(eventId, 'editor'),
    getEventRoleClients(eventId, 'viewer'),
  ]);

  return { owners, managers, editors, viewers };
}

export default getEventClients;
