import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import serverless from 'serverless-http';
import { readFileSync } from 'fs-extra';
import { splitPdf } from './pdf/split/splitPdf';

const app: Application = express();
app.use(cors());

const fileMiddleware = multer({ dest: '/tmp/' }).single('file');

app.post('/pdf/split', fileMiddleware, async (req: Request, res: Response) => {
  if (req.file) {
    const buffer = readFileSync(req.file.path) as Buffer;
    const fileName = req.file.originalname.replace('.pdf', '');
    console.log(`Entering split function with filename ${fileName}`);
    const resultFilePath = await splitPdf(fileName, buffer, req.body.pageName, JSON.parse(req.body.pageOptions));
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log('File not deleted', err);
      }
    });
    res
      .header({
        'Content-Type': 'application/zip',
      })
      .status(200)
      .download(resultFilePath, () => {
        fs.rmSync(resultFilePath.replace(`/${fileName}.zip`, ''), { recursive: true });
      });
  }
});

app.get('/test', async (req: Request, res: Response) => {
  res.status(200).json({ data: 'hello' });
});

export const handler = serverless(app);
export default app;
