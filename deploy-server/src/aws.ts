import {S3} from 'aws-sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT,
})

async function downloadS3Folder(prefix : string){
    console.log('Downloading folder from S3:', prefix);
    try {
        const allFiles = await s3.listObjectsV2({
            Bucket: "vercel",
            Prefix: prefix
        }).promise();
        
        console.log(`Found ${allFiles.Contents?.length || 0} files to download`);

        const allPromises = allFiles.Contents?.map(async ({Key}) => {
            return new Promise(async (resolve, reject) => {
                if(!Key) return resolve("");
                // Remove 'repos/' prefix from Key to avoid duplication
                const relativePath = Key.replace(/^repos\//, '');
                const finalOutputPath = path.join(__dirname, 'repos', relativePath);
                const dirName = path.dirname(finalOutputPath);
                const outputFile = fs.createWriteStream(finalOutputPath);
                if(!fs.existsSync(dirName)){
                    fs.mkdirSync(dirName,{recursive:true});
                }
                s3.getObject({
                    Bucket: "vercel",
                    Key: Key
                }).createReadStream().pipe(outputFile)
                .on('finish',() => {
                    console.log('Downloaded file:', finalOutputPath);
                    resolve("");
                })
                .on('error', (err) => {
                    console.error('Error downloading file:', Key, err);
                    reject(err);
                })
            })
        }) || [];
        
        await Promise.all(allPromises);
        console.log('All files downloaded successfully');
    } catch (error) {
        console.error('Error in downloadS3Folder:', error);
        throw error;
    }
}

export {downloadS3Folder};