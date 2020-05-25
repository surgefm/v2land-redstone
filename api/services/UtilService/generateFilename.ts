import uniqueString from 'unique-string';

function generateFilename(file: { originalname: string }) {
  const { originalname } = file;
  const parts = originalname.split('.');
  const extension = parts[parts.length - 1].toLowerCase();
  const newFilename = uniqueString() + Date.now() + '.' + extension;
  return newFilename;
}

export default generateFilename;
