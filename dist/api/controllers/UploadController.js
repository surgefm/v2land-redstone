"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const _Services_1 = require("@Services");
const UploadService_1 = require("@Services/UploadService");
function upload(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { S3_KEY, S3_BUCKET } = process.env;
        if (!(S3_KEY && S3_BUCKET)) {
            return res.status(503).json({
                message: '暂不支持文件上传。如需开启该功能请联系管理员配置环境变量 S3_ID、S3_KEY 与 S3_BUCKET。',
            });
        }
        const filename = _Services_1.UtilService.generateFilename(req.file);
        yield UploadService_1.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: filename,
            Body: req.file.buffer,
            ACL: 'public-read',
            StorageClass: 'INTELLIGENT_TIERING',
        }));
        res.status(201).json({
            message: '上传成功',
            name: filename,
        });
    });
}
exports.upload = upload;

//# sourceMappingURL=UploadController.js.map
