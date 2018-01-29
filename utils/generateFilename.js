const md5 = require('md5');

module.exports = (file) => {
  const { filename } = file;
  const parts = filename.split('.');
  const extension = parts[parts.length - 1];
  const newFilename = md5(Date.now() + Math.random() * 9999 + filename) + '.' + extension;
  return newFilename;
};
