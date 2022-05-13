import { Client } from '@Models';
import generateRandomAlphabetString from '../UtilService/generateRandomAlphabetString';

async function randomlyGenerateUsername(defaultValue: string = null, length = 12): Promise<string> {
  let string = defaultValue || generateRandomAlphabetString();

  const testClient = new Client({ username: string });
  try {
    await testClient.validate({ fields: ['username'] });
  } catch (err) {
    return randomlyGenerateUsername(null, length);
  }

  if (await Client.findOne({ where: { username: string } })) {
    return randomlyGenerateUsername(null, length);
  }

  return string;
}

export default randomlyGenerateUsername;
