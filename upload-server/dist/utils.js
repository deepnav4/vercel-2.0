"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
exports.getAllFiles = getAllFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function generate() {
    const subset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 7; i++) {
        const randomIndex = Math.floor(Math.random() * subset.length);
        result += subset[randomIndex];
    }
    return result;
}
function getAllFiles(folderPath) {
    let response = [];
    const allFilesAndFolders = fs_1.default.readdirSync(folderPath);
    allFilesAndFolders.forEach(file => {
        const fullFilePath = path_1.default.join(folderPath, file);
        if (fs_1.default.statSync(fullFilePath).isDirectory()) {
            const nestedFiles = getAllFiles(fullFilePath);
            response = response.concat(nestedFiles);
        }
        else {
            response.push(fullFilePath);
        }
    });
    return response;
}
//# sourceMappingURL=utils.js.map