const fs = require('fs');
const colors = require('colors');
const process = require('process');

let ok;

let modelList = fs.readdirSync('api/models');
ok = true;
modelList.forEach((val) => {
  let regexResult = /(.+)\.js/.exec(val);
  if (regexResult) {
    let name = regexResult[1];

    let testPath = `tests/integration/models/${name}.test.js`;

    if (!fs.existsSync(testPath)) {
      console.error(`${colors.red('Test completeness error: ')}${testPath}`);
      ok = false;
    }
  }
});

let controllerList = fs.readdirSync('api/controllers');

controllerList.forEach((val) => {
  let regexResult = /(.+)\.js/.exec(val);
  if (regexResult) {
    let name = regexResult[1];

    let testPath = `tests/integration/controllers/${name}.test.js`;

    if (!fs.existsSync(testPath)) {
      console.error(`${colors.red('Test completeness error: ')}${testPath}`);
      ok = false;
    }
  }
});

if (!ok) {
  process.exit(1);
}
