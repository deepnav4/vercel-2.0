import { S3 } from 'aws-sdk';
import fs, { access } from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT,
})

const uploadFile = async (fileName : string,localFilePath : string) => {
    console.log('Uploading file to S3:', fileName);
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body : fileContent,
        Bucket : "vercel",
        Key : fileName
    }).promise();
    console.log(response);
}

const clearBucket = async () => {
    try {
        const listedObjects = await s3.listObjectsV2({ Bucket: "vercel" }).promise();
        
        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log('Bucket is already empty');
            return;
        }

        const deleteParams = {
            Bucket: "vercel",
            Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! })) }
        };

        await s3.deleteObjects(deleteParams).promise();
        console.log(`Deleted ${listedObjects.Contents.length} objects from bucket`);

        if (listedObjects.IsTruncated) await clearBucket();
    } catch (error) {
        console.error('Error clearing bucket:', error);
    }
}

export { uploadFile, clearBucket };