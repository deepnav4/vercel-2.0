import { exec } from 'child_process';
import path from 'path';

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