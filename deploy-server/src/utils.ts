import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import {S3} from 'aws-sdk';
import dotenv from 'dotenv';

export function buildProject(id : string){
    return new Promise((resolve) => {
        const projectPath = path.join(__dirname, 'repos', id);
        const child = exec(`cd "${projectPath}" && npm install && npm run build`);

        child.stdout?.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.stderr?.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve(true);
        });
    })
}


function getAllFiles(folderPath: string) {
    let response : string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path.join(folderPath, file);
        if(fs.statSync(fullFilePath).isDirectory()){
            const nestedFiles = getAllFiles(fullFilePath);
            response = response.concat(nestedFiles);
        } else {
            response.push(fullFilePath);
        }
    });

    return response;
}



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

export async function copyFinalBuildToS3(id : string){
    const projectPath = path.join(__dirname, 'repos', id);
    
    // Check for dist or build folder
    let folderPath = path.join(projectPath, 'dist');
    if (!fs.existsSync(folderPath)) {
        folderPath = path.join(projectPath, 'build');
        if (!fs.existsSync(folderPath)) {
            console.error(`No dist or build folder found in ${projectPath}`);
            throw new Error('Build output folder not found');
        }
    }
    
    console.log(`Uploading from: ${folderPath}`);
    const files = getAllFiles(folderPath);

    await Promise.all(
        files.map(async file => {
            const relativePath = path.relative(folderPath, file).replace(/\\/g, '/');
            await uploadFile(`dist/${id}/${relativePath}`, file);
        })
    );
    console.log(`All built files uploaded to dist/${id}/`);
}