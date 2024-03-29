import { InviteCode, Client } from '@Models';
import { Transaction } from 'sequelize';
import { findClient } from './ClientService';
import { generateRandomAlphabetString } from './UtilService';

export const createInviteCode = async (ownerId: Client | number | string): Promise<string> => {
  const owner = await findClient(ownerId);
  let code = `${owner.id}-${generateRandomAlphabetString()}`;
  while (await InviteCode.findOne({ where: { code } })) {
    code = `${owner.id}-${generateRandomAlphabetString()}`;
  }
  await InviteCode.create({
    ownerId: owner.id,
    code,
  });
  return code;
};

export const isValid = async (code: string): Promise<false | InviteCode> => {
  const invite = await InviteCode.findOne({ where: { code } });
  if (!invite) return false;
  if (invite.userId) return false;
  return invite;
};

export const useInviteCode = async (code: InviteCode, user: Client, transaction?: Transaction): Promise<void> => {
  code.userId = user.id;
  await code.save({ transaction });
};
