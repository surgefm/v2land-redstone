const fs = require('fs');
const colors = require('colors');
const process = require('process');

let ok;

const modelList = fs.readdirSync('api/models');
ok = true;
modelList.forEach((val) => {
  const regexResult = /(.+)\.js/.exec(val);
  if (regexResult) {
    const name = regexResult[1];

    const testPath = `tests/integration/models/${name}.test.js`;

    if (!fs.existsSync(testPath)) {
      console.error(`${colors.red('Test completeness error: ')}${testPath}`);
      ok = false;
    }
  }
});

const controllerList = fs.readdirSync('api/controllers');

controllerList.forEach((val) => {
  const regexResult = /(.+)\.js/.exec(val);
  if (regexResult) {
    const name = regexResult[1];

    const testPath = `tests/integration/controllers/${name}.test.js`;

    if (!fs.existsSync(testPath)) {
      console.error(`${colors.red('Test completeness error: ')}${testPath}`);
      ok = false;
    }
  }
});

if (!ok) {
  process.exit(1);
}
