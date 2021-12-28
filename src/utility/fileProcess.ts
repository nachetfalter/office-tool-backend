import fs from 'fs';
import rimraf from 'rimraf';
import JSZip from 'jszip';

export const makeZipFile = async (fileName: string, filePath: string, savePath: string) => {
  const zip = new JSZip();
  const files = fs.readdirSync(filePath);
  files.forEach((file) => {
    zip.file(file, fs.readFileSync(`${filePath}/${file}`));
  });

  return new Promise((resolve) =>
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(`${savePath}/${fileName}.zip`))
      .on('finish', () => {
        resolve(1);
      }),
  );
};

export const deleteFolders = (...filePaths: string[]) => {
  for (const filePath of filePaths) {
    fs.rmSync(filePath, { recursive: true });
  }
};

export const recreatePath = (path: string) => {
  rimraf.sync(path);
  fs.mkdirSync(path, { recursive: true });
};
