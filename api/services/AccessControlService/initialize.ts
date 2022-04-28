import { guests, contributors, editors, managers, admins } from './roles';
import { allow, addRoleParents, removeAllow } from './operations';

export default async function initialize(): Promise<void> {
  // Define guests’ permission
  await allow(guests, ['events', 'stacks', 'news'], 'view');

  // Define contributors’ permission
  await addRoleParents(contributors, guests);
  await allow(contributors, 'events', ['create', 'edit', 'publish', 'delete']);
  await allow(contributors, 'stacks', ['create', 'edit', 'delete']);
  await allow(contributors, 'news', ['create', 'delete']);

  // Define editors’ permission
  await addRoleParents(editors, contributors);
  await allow(editors, 'headlines', '*');
  await allow(editors, 'news', ['edit']);
  await allow(editors, 'all-admitted-events', ['view', 'edit']);
  await removeAllow(editors, 'all-events', ['view', 'edit']);

  // Define managers’ permission
  await addRoleParents(managers, editors);
  await allow(managers, 'all-tags', '*');
  await allow(editors, 'all-events', ['view', 'edit']);

  // Define admins’ permission
  await addRoleParents(admins, editors);
  await allow(admins, 'no-admin-roles', ['view', 'create', 'edit', 'delete']);
  await allow(admins, 'admin-roles', 'view');

  // const clients = await Client.findAll();
  // for (const client of clients) {
  //   if (client.role === 'admin') {
  //     await addUserRoles(client.id, admins);
  //   } else if (client.role === 'manager') {
  //     await addUserRoles(client.id, managers);
  //   } else if (client.role === 'editor') {
  //     await addUserRoles(client.id, editors);
  //   } else {
  //     await addUserRoles(client.id, contributors);
  //   }
  // }
}
