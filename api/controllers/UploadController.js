/**
 * UploadController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const s3 = require('skipper-s3');
const md5 = require('md5');

module.exports = {

  upload: async (req, res) => {
    const { S3_ID, S3_KEY, S3_BUCKET } = process.env;
    if (!(S3_ID && S3_KEY && S3_BUCKET)) {
      return res.status(503).json({
        message: '暂不支持文件上传。如需开启该功能请联系管理员配置环境变量 S3_ID、S3_KEY 与 S3_BUCKET。',
      });
    }

    const filename = req.file('file')._files[0].stream.filename;
    const parts = filename.split('.');
    const extension = parts[parts.length - 1];
    const newFilename = md5(Date.now() + Math.random() * 9999 + filename) + '.' + extension;

    req.file('file').upload({
      adapter: s3,
      key: S3_ID,
      secret: S3_KEY,
      bucket: S3_BUCKET,
      saveAs: newFilename,
      headers: {
        'x-amz-acl': 'public-read',
      },
    }, (err, file) => {
      if (err) {
        return res.error(err);
      } else {
        return res.status(201).json({
          message: '上传成功',
          name: newFilename,
        });
      }
    });
  },

};
