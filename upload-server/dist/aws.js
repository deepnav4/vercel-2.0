"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBucket = exports.uploadFile = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT,
});
const uploadFile = async (fileName, localFilePath) => {
    console.log('Uploading file to S3:', fileName);
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName
    }).promise();
    console.log(response);
};
exports.uploadFile = uploadFile;
const clearBucket = async () => {
    try {
        const listedObjects = await s3.listObjectsV2({ Bucket: "vercel" }).promise();
        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log('Bucket is already empty');
            return;
        }
        const deleteParams = {
            Bucket: "vercel",
            Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key })) }
        };
        await s3.deleteObjects(deleteParams).promise();
        console.log(`Deleted ${listedObjects.Contents.length} objects from bucket`);
        if (listedObjects.IsTruncated)
            await clearBucket();
    }
    catch (error) {
        console.error('Error clearing bucket:', error);
    }
};
exports.clearBucket = clearBucket;
//# sourceMappingURL=aws.js.map