import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import serverless from 'serverless-http';
import { readFileSync } from 'fs-extra';
import { splitPdf } from './pdf/split/splitPdf';
import { createPathIfNotExist } from './utility/fileProcess';

const app: Application = express();
app.use(cors());

createPathIfNotExist('/tmp/');
const fileMiddleware = multer({ dest: '/tmp/' }).single('file');

app.post('/pdf/split', fileMiddleware, async (req: Request, res: Response) => {
  if (req.file) {
    const buffer = readFileSync(req.file.path) as Buffer;
    const fileName = req.file.originalname.replace('.pdf', '');
    const encryptedFileName = req.file.filename;
    console.log(`Entering split function with filename ${fileName}`);
    const resultFilePath = await splitPdf(
      fileName,
      encryptedFileName,
      buffer,
      req.body.pageName,
      JSON.parse(req.body.pageOptions),
    );
    fs.rmSync(req.file.path);
    res
      .header({
        'Content-Type': 'application/octet-stream',
        isBase64Encoded: true,
      })
      .status(200)
      .send(fs.readFileSync(resultFilePath).toString('base64'));
    const { size } = fs.statSync(resultFilePath);
    console.log(`file size ${size}`);
    fs.rmSync(resultFilePath.replace(`/${fileName}.zip`, ''), { recursive: true });
  }
});

export const handler = serverless(app);

app.listen(8000);
export default app;
