import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService } from '@Services';

import { S3 } from 'aws-sdk';
const s3 = new S3({ apiVersion: '2006-03-01' });

export async function upload(req: RedstoneRequest, res: RedstoneResponse) {
  const { S3_ID, S3_KEY, S3_BUCKET } = process.env;
  if (!(S3_ID && S3_KEY && S3_BUCKET)) {
    return res.status(503).json({
      message: '暂不支持文件上传。如需开启该功能请联系管理员配置环境变量 S3_ID、S3_KEY 与 S3_BUCKET。',
    });
  }

  const filename = UtilService.generateFilename(req.file);
  return new Promise((resolve, reject) => {
    s3.upload({
      Bucket: S3_BUCKET,
      Key: S3_ID,
      Body: req.file,
      ACL: 'public-read',
      StorageClass: 'INTELLIGENT_TIERING',
    }, async (err) => {
      if (err) return reject(err);
      resolve(res.status(201).json({
        message: '上传成功',
        name: filename,
      }));
    });
  });
}
