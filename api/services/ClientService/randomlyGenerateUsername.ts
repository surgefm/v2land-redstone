import { Client } from '@Models';

export const charset = Array.from(Array(26))
  .map((_, i) => i + 97)
  .map((x) => String.fromCharCode(x));

async function randomlyGenerateUsername(length = 12): Promise<string> {
  let string = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charset.length);
    string += charset[index];
  }

  if (await Client.findOne({ where: { username: string } })) {
    return randomlyGenerateUsername(length);
  }

  return string;
}

export default randomlyGenerateUsername;
