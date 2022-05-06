export const charset = Array.from(Array(26))
  .map((_, i) => i + 97)
  .map((x) => String.fromCharCode(x));

export const alphabet = charset;

function generateRandomAlphabetString(length = 12): string {
  let string = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * charset.length);
    string += charset[index];
  }

  return string;
}

export default generateRandomAlphabetString;
