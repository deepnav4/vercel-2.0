import { createClient } from 'redis';
import { downloadS3Folder } from './aws';
import { buildProject } from './utils';
import { copyFinalBuildToS3 } from './utils';
const publisher = createClient({
socket: {
        host: '127.0.0.1',
        port: 6379
    }
});
const subscriber = createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});

subscriber.on('error', (err) => console.error('Redis Client Error', err));
publisher.on('error', (err) => console.error('Redis Client Error', err));
async function main() {
    await subscriber.connect();
    await publisher.connect();
    console.log('Connected to Redis, waiting for messages...');
    
    // Check if there are existing items in the queue
    const queueLength = await subscriber.lLen('build-queue');
    console.log(`Current queue length: ${queueLength}`);
    
    while(true){
        console.log('Waiting for folder from queue...');
        const folderName = await subscriber.brPop('build-queue',0);
        console.log('Received folder for building:', folderName);
        // @ts-ignore
        const folder = folderName.element;
        console.log('Starting download for folder:', folder);
        try {
            publisher.hSet("status",folder,"deploying");
            console.log('Status set to deploying for folder:', folder);
            await downloadS3Folder(`repos/${folder}`);
            console.log('Download completed for folder:', folder);
            await buildProject(folder);
            console.log('Build completed for folder:', folder);
            await copyFinalBuildToS3(folder);
            publisher.hSet("status",folder,"deployed");
            console.log('Final build copied to S3 for folder:', folder);
        } catch (error) {
            console.error('Error processing folder:', error);
        }
    }
}

main();