const pinyin = require('pinyin');

async function generatePinyin (name) {
  const array = pinyin(name, {
    segment: false,
    style: 0,
  });

  const characters = [];
  for (let i = 0; i < 9; i++) {
    if (!array[i]) break;
    if (/^[a-z]*$/.test(array[i])) {
      characters.push(array[i]);
    }
  }

  return characters.length > 1
    ? characters.join('-')
    : null;
}

module.exports = generatePinyin;
