"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
files.forEach(async (file) => {
    await uploadFile(file.slice(file.indexOf(`repos\\${folderName}\\`) + (`repos\\${folderName}\\`).length).replace(/\\/g, '/'), file);
});
//# sourceMappingURL=tempCodeRunnerFile.js.map