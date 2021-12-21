import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync } from 'fs-extra';
import splitPdf from './pdf/split/splitPdf';

const app: Application = express();
app.use(cors());

const fileMiddleware = multer({ dest: 'uploads/' }).single('file');

app.post('/pdf/split', fileMiddleware, async (req: Request, res: Response) => {
  if (req.file) {
    const buffer = readFileSync(req.file.path) as Buffer;
    await splitPdf(buffer, req.body.pageName, JSON.parse(req.body.pageOptions));
  }
  res.status(200).json({ a: 'miao' });
});

export default app;
