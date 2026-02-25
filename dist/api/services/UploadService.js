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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFromUrl = exports.s3 = exports.hasS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const download_1 = __importDefault(require("download"));
const UtilService_1 = require("./UtilService");
const { S3_KEY, S3_SECRET, S3_BUCKET } = process.env;
exports.hasS3 = S3_KEY && S3_SECRET && S3_BUCKET;
exports.s3 = exports.hasS3 ? new client_s3_1.S3Client({
    // The key apiVersion is no longer supported in v3, and can be removed.
    // @deprecated The client uses the "latest" apiVersion.
    apiVersion: '2006-03-01',
    endpoint: 'https://sfo3.digitaloceanspaces.com',
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
    },
}) : null;
const uploadFromUrl = (url, extension) => __awaiter(void 0, void 0, void 0, function* () {
    if (!exports.hasS3)
        return;
    const filename = (0, UtilService_1.generateFilename)({ originalname: extension });
    const buffer = yield (0, download_1.default)(url, 'dist');
    yield exports.s3.send(new client_s3_1.PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: filename,
        Body: buffer,
        ACL: 'public-read',
        StorageClass: 'INTELLIGENT_TIERING',
    }));
    return filename;
});
exports.uploadFromUrl = uploadFromUrl;

//# sourceMappingURL=UploadService.js.map
