import express from 'express';
const app = express();
import { S3 } from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();
const s3 = new S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    endpoint: process.env.ENDPOINT,
})

app.use(async (req, res) => {
    const host = req.hostname;
    
    const id = host.split('.')[0];
    const filePath = req.path;
    
    console.log(`Request: ${host}${filePath}`);
    console.log(`Subdomain ID: ${id}`);
    console.log(`S3 Key: dist/${id}${filePath}`);

    try {
        const contents = await s3.getObject({
            Bucket: "vercel",
            Key : `dist/${id}${filePath}`
        }).promise();

        const type = filePath.endsWith('html') ? 'text/html' : filePath.endsWith('css') ?  "text/css" : 'application/javascript';

        res.set("Content-Type",type);
        res.send(contents.Body);
    } catch (error) {
        console.error('Error fetching file from S3:', error);
        res.status(404).send('File not found');
    }
});

app.listen(3001, () => {
    console.log('Request handler server running on port 3001');
});