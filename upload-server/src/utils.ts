import fs from 'fs';
import path from 'path';

function generate(){
    const subset = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * subset.length);
        result += subset[randomIndex];
    }
    return result;
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

export { generate, getAllFiles };