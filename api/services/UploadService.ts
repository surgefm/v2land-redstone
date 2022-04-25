import { S3 } from 'aws-sdk';
import download from 'download';
import { generateFilename } from './UtilService';

const { S3_KEY, S3_SECRET, S3_BUCKET } = process.env;
export const hasS3 = S3_KEY && S3_SECRET && S3_BUCKET;

export const s3 = hasS3 ? new S3({
  apiVersion: '2006-03-01',
  endpoint: 'https://sfo3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  },
}) : null;

export const uploadFromUrl = async (url: string, extension: string): Promise<string> => {
  if (!hasS3) return;
  const filename = generateFilename({ originalname: extension });
  const buffer = await download(url, 'dist');
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: S3_BUCKET,
      Key: filename,
      Body: buffer,
      ACL: 'public-read',
      StorageClass: 'INTELLIGENT_TIERING',
    }, (err: any) => {
      if (err) return reject(err);
      resolve(filename);
    });
  });
};
