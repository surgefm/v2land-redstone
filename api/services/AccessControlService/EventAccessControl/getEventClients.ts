import getEventRoleClients from './getEventRoleClients';

async function getEventClients(eventId: number) {
  return {
    owners: await getEventRoleClients(eventId, 'owner'),
    managers: await getEventRoleClients(eventId, 'manager'),
    editors: await getEventRoleClients(eventId, 'editor'),
    viewers: await getEventRoleClients(eventId, 'viewer'),
  };
}

export default getEventClients;
