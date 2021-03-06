import fs from 'fs';
import rimraf from 'rimraf';
import JSZip from 'jszip';

export const makeZipFile = async (fileName: string, sourcePath: string, targetPath: string) => {
  const zip = new JSZip();
  const files = fs.readdirSync(sourcePath);
  files.forEach((file) => {
    const { size } = fs.statSync(`${sourcePath}/${file}`);
    console.log(`${file} size ${size}`);
    zip.file(file, fs.readFileSync(`${sourcePath}/${file}`));
  });

  return new Promise((resolve) =>
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(fs.createWriteStream(`${targetPath}/${fileName}.zip`))
      .on('finish', () => {
        resolve(1);
      }),
  );
};

export const deleteFolders = (...filePaths: string[]) => {
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true });
    }
  }
};

export const recreatePath = (path: string) => {
  rimraf.sync(path);
  fs.mkdirSync(path, { recursive: true });
};

export const createPathIfNotExist = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
};
