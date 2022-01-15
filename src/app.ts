import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import serverless from 'serverless-http';
import { readFileSync } from 'fs-extra';
import { splitPdf } from './pdf/split/splitPdf';
import { mergeImagesToPdf } from './pdf/merge/mergeImagesToPdf';
import { createPathIfNotExist } from './utility/file';

const app: Application = express();
app.use(cors());

createPathIfNotExist('/tmp/pdf');
const fileMiddleware = multer({ dest: '/tmp/pdf' });

app.post('/pdf/split', fileMiddleware.single('file'), async (req: Request, res: Response) => {
  if (req.file) {
    const buffer = readFileSync(req.file.path) as Buffer;
    const fileName = req.file.originalname.replace('.pdf', '');
    const encryptedFileName = req.file.filename;
    console.log(`Entering split function with filename ${fileName} of size ${req.file.size}`);
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

app.post('/pdf/merge', fileMiddleware.array('files', 300), async (req: Request, res: Response) => {
  if (req.files) {
    const files = req.files as Express.Multer.File[];
    const filePaths = files.map((file) => file.path);
    const resultFilePath = await mergeImagesToPdf(filePaths, uuid(), req.body.outputFileName);
    files.forEach((file) => fs.rmSync(file.path));
    res
      .header({
        'Content-Type': 'application/octet-stream',
        isBase64Encoded: true,
      })
      .status(200)
      .send(fs.readFileSync(resultFilePath).toString('base64'));
    const { size } = fs.statSync(resultFilePath);
    console.log(`file size ${size}`);
    fs.rmSync(resultFilePath.replace(`/${req.body.outputFileName}.pdf`, ''), { recursive: true });
  }
});

export const handler = serverless(app);

/* istanbul ignore next */
if (process.env.ENVIRONMENT === 'local') {
  app.listen(8000);
}

export default app;
