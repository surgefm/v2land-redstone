import { guests, contributors, editors, admins } from './roles';
import { allow, addRoleParents } from './operations';

export default async function initialize(): Promise<any> {
  // Define guests’ permission
  await allow(guests, ['events', 'stacks', 'news'], 'view');

  // Define contributors’ permission
  await addRoleParents(contributors, guests);
  await allow(contributors, 'events', ['create', 'edit', 'publish', 'delete']);
  await allow(contributors, 'stacks', ['create', 'edit', 'delete']);
  await allow(contributors, 'news', ['create', 'edit', 'delete']);

  // Define editors’ permission
  await addRoleParents(editors, contributors);
  await allow(editors, 'tags', '*');
  await allow(editors, 'headlines', '*');

  // Define admins’ permission
  await addRoleParents(admins, editors);
  await allow(admins, 'client', '*');
  await allow(admins, 'non-admin-client', 'updateRoles');
}
