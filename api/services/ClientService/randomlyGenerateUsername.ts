import { Client } from '@Models';
import generateRandomAlphabetString from '../UtilService/generateRandomAlphabetString';

async function randomlyGenerateUsername(length = 12): Promise<string> {
  let string = generateRandomAlphabetString();

  if (await Client.findOne({ where: { username: string } })) {
    return randomlyGenerateUsername(length);
  }

  return string;
}

export default randomlyGenerateUsername;
