import pinyin from 'pinyin';

async function generatePinyin(name: string) {
  const array = pinyin(name.toLowerCase(), {
    segment: false,
    style: 0,
  });

  const characters = [];
  for (let i = 0; i < Math.min(array.length, 9); i++) {
    if (/^[a-z]*$/.test(array[i][0])) {
      characters.push(array[i][0]);
    }
  }

  return characters.length > 1
    ? characters.join('-')
    : characters[0];
}

export default generatePinyin;
