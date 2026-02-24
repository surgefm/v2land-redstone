import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import download from 'download';
import { generateFilename } from './UtilService';

const { S3_KEY, S3_SECRET, S3_BUCKET } = process.env;
export const hasS3 = S3_KEY && S3_SECRET && S3_BUCKET;

export const s3 = hasS3 ? new S3Client({
  // The key apiVersion is no longer supported in v3, and can be removed.
  // @deprecated The client uses the "latest" apiVersion.
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
  await s3.send(
      new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: filename,
      Body: buffer,
      ACL: 'public-read',
      StorageClass: 'INTELLIGENT_TIERING',
    })
  );
  return filename
};
