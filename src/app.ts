import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { readFileSync } from 'fs-extra';
import splitPdf from './pdf/split/splitPdf';

const app: Application = express();
app.use(cors());

const fileMiddleware = multer({ dest: 'uploads/' }).single('file');

app.post('/pdf/split', fileMiddleware, async (req: Request, res: Response) => {
  if (req.file) {
    const buffer = readFileSync(req.file.path) as Buffer;
    const resultFilePath = await splitPdf(
      req.file.originalname.replace('.pdf', ''),
      buffer,
      req.body.pageName,
      JSON.parse(req.body.pageOptions),
    );
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log('File not deleted', err);
      }
    });
    res.status(200).download(resultFilePath, req.file.originalname.replace('.pdf', '.zip'));
  }
});

export default app;
