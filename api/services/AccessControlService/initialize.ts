import acl from './acl';
import { guests, contributors, editors, admins } from './roles';
import { allow, addRoleParents } from './operations';

export default async function initialize(): Promise<void> {
  await (acl as any).redis.connect();

  // Define guests’ permission
  await allow(guests, ['events', 'stacks', 'news'], 'view');

  // Define contributors’ permission
  await addRoleParents(contributors, guests);
  await allow(contributors, 'events', ['create', 'edit', 'publish', 'delete']);
  await allow(contributors, 'stacks', ['create', 'edit', 'delete']);
  await allow(contributors, 'news', ['create', 'delete']);

  // Define editors’ permission
  await addRoleParents(editors, contributors);
  await allow(editors, 'all-tags', '*');
  await allow(editors, 'headlines', '*');
  await allow(editors, 'news', ['edit']);

  // Define admins’ permission
  await addRoleParents(admins, editors);
  await allow(admins, 'all-events', ['view', 'edit']);
  await allow(admins, 'no-admin-roles', ['view', 'create', 'edit', 'delete']);
  await allow(admins, 'admin-roles', 'view');
}
