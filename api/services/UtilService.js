const uniqueString = require('unique-string');

module.exports = {

  generateFilename: (file) => {
    const { filename } = file;
    const parts = filename.split('.');
    const extension = parts[parts.length - 1].toLowerCase();
    const newFilename = uniqueString() + Date.now() + '.' + extension;
    return newFilename;
  },

};
