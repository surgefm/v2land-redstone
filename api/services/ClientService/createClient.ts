import { Transaction } from 'sequelize';
import { Client, Record } from '@Models';

import * as AccessControlService from '../AccessControlService';
import * as InviteCodeService from '../InviteCodeService';
import * as UtilService from '../UtilService';
import * as RedisService from '../RedisService';
import * as EmailService from '../EmailService';
import tokenGenerator from './tokenGenerator';
import updateAlgoliaIndex from './updateAlgoliaIndex';

type UserData = {
  username: string;
  nickname?: string;
  description?: string;
  hashedPassword?: string;
  avatar?: string;
  email?: string;
  emailVerified?: boolean;
  inviteCode?: string;
}

async function createClient({
  username,
  nickname,
  description,
  hashedPassword = '',
  email = '',
  avatar,
  emailVerified = false,
  inviteCode,
}: UserData, transaction?: Transaction): Promise<Client> {
  let client: Client;

  await UtilService.execWithTransaction(async (transaction: Transaction) => {
    const code = inviteCode && await InviteCodeService.isValid(inviteCode);
    const role = inviteCode ? 'editor' : 'contributor';

    client = await Client.create({
      username,
      nickname: nickname || username,
      description,
      password: hashedPassword,
      avatar,
      email: email,
      emailVerified,
      role,
    }, {
      raw: true,
      transaction,
    });

    if (code) {
      await InviteCodeService.useInviteCode(code, client, transaction);
    }

    await AccessControlService.allowClientToEditRole(client.id, client.id);
    await AccessControlService.addUserRoles(client.id, role === 'editor'
      ? AccessControlService.roles.editors
      : AccessControlService.roles.contributors);

    await Record.create({
      model: 'Client',
      operation: 'create',
      data: client,
      target: client.id,
      action: 'createClient',
    }, { transaction });

    if (!emailVerified) {
      const verificationToken = tokenGenerator();
      await Record.create({
        model: 'Miscellaneous',
        operation: 'create',
        data: {
          clientId: client.id,
          verificationToken,
          expire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        },
        target: client.id,
        action: 'createClientVerificationToken',
      }, { transaction });
      EmailService.register(client, verificationToken);
    }
  }, transaction);

  updateAlgoliaIndex({ clientId: client.id, transaction });
  await RedisService.set(RedisService.getClientIdKey(client.username), client.id);

  return client;
}

export default createClient;
