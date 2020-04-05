import uniqueString from 'unique-string';

function generateFilename (file: { filename: string }) {
  const { filename } = file;
  const parts = filename.split('.');
  const extension = parts[parts.length - 1].toLowerCase();
  const newFilename = uniqueString() + Date.now() + '.' + extension;
  return newFilename;
}

export default generateFilename;
