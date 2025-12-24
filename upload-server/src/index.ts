import express from 'express';
const app = express();
import simpleGit from 'simple-git';
import { generate ,getAllFiles} from './utils';
import path from 'path';
import { uploadFile, clearBucket } from './aws';
import { createClient } from 'redis';
const publisher = createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});
publisher.connect().catch(err => {
    console.log('Redis connection failed:', err.message);
    console.log('Continuing without Redis...');
});

app.use(express.json());
// app.use(cors());
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
// clearBucket();

app.post('/deploy',async (req, res) => {
    const git = simpleGit();
    const repoUrl = req.body.repoUrl;
    const folderName = generate();
    const repoPath = path.join(__dirname, `repos/${folderName}`);
    try {
        await git.clone(repoUrl, repoPath);
        const files = getAllFiles(repoPath);
        files.forEach(async file => {
            const relativePath = path.relative(path.join(__dirname, 'repos'), file).replace(/\\/g, '/');
            await uploadFile(relativePath, file);
        })
        publisher.lPush('build-queue',folderName);
        res.status(200).send({ message: 'Repository cloned successfully', folderName });
    } catch (error) {
        res.status(500).send({ message: 'Error cloning repository', error });
    } 
});


app.post('/remove', async (req, res) => {
    const folderName = req.body.folderName;
    const fs = await import('fs/promises');
    try {
        await fs.rm(`./repos/${folderName}`, { recursive: true, force: true });
        res.status(200).send({ message: 'Repository removed successfully' });
    }
    catch (error) {
        res.status(500).send({ message: 'Error removing repository', error });
    }
});

app.listen(3000);