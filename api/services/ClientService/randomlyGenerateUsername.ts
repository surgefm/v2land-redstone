import { Client } from '@Models';
import generateRandomAlphabetString from '../UtilService/generateRandomAlphabetString';

async function randomlyGenerateUsername(defaultValue: string = null, length = 12): Promise<string> {
  let string = defaultValue || generateRandomAlphabetString();

  if (await Client.findOne({ where: { username: string } })) {
    return randomlyGenerateUsername(null, length);
  }

  return string;
}

export default randomlyGenerateUsername;
