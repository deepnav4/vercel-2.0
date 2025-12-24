"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const simple_git_1 = __importDefault(require("simple-git"));
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const aws_1 = require("./aws");
const redis_1 = require("redis");
const publisher = (0, redis_1.createClient)({
    socket: {
        host: '127.0.0.1',
        port: 6379
    }
});
publisher.connect().catch(err => {
    console.log('Redis connection failed:', err.message);
    console.log('Continuing without Redis...');
});
app.use(express_1.default.json());
// app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
(0, aws_1.clearBucket)();
app.post('/deploy', async (req, res) => {
    const git = (0, simple_git_1.default)();
    const repoUrl = req.body.repoUrl;
    const folderName = (0, utils_1.generate)();
    const repoPath = path_1.default.join(__dirname, `repos/${folderName}`);
    try {
        await git.clone(repoUrl, repoPath);
        const files = (0, utils_1.getAllFiles)(repoPath);
        files.forEach(async (file) => {
            const relativePath = path_1.default.relative(path_1.default.join(__dirname, 'repos'), file).replace(/\\/g, '/');
            await (0, aws_1.uploadFile)(relativePath, file);
        });
        publisher.lPush('build-queue', folderName);
        res.status(200).send({ message: 'Repository cloned successfully', folderName });
    }
    catch (error) {
        res.status(500).send({ message: 'Error cloning repository', error });
    }
});
app.post('/remove', async (req, res) => {
    const folderName = req.body.folderName;
    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
    try {
        await fs.rm(`./repos/${folderName}`, { recursive: true, force: true });
        res.status(200).send({ message: 'Repository removed successfully' });
    }
    catch (error) {
        res.status(500).send({ message: 'Error removing repository', error });
    }
});
app.listen(3000);
//# sourceMappingURL=index.js.map