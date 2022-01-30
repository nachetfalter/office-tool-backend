import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import serverless from 'serverless-http';
import { readFileSync } from 'fs-extra';
import { body, validationResult } from 'express-validator';
import fileMiddleware from './middleware/fileMiddleware';
import { splitPdf } from './pdf/split/splitPdf';
import { mergeImagesToPdf } from './pdf/merge/mergeImagesToPdf';
import { cleanString } from './utility/string';
import fileMiddlewareErrors from './middleware/fileMiddlewareErrors';

const app: Application = express();
app.use(cors());
dotenv.config();

const getValidationErrors = (req: Request) => {
  const validationErrors = validationResult(req).array();
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors.map((validationError) => validationError.msg);
    return Array.from(new Set(errorMessage));
  }
  return [];
};
const pdfMiddleware = fileMiddleware('/tmp/pdf', 150000000, ['application/pdf'], 1);

app.post(
  '/pdf/split',
  pdfMiddleware,
  [
    body('pageName', 'The page name is not set or is invalid').notEmpty().isString().isLength({ min: 1, max: 100 }),
    body('pageOptions', 'The page option is not set properly').notEmpty().isJSON(),
    body('pageOptions.split', 'The page split option is invalid').custom((_, { req }) => {
      if (
        !req.body.pageOptions ||
        !['horizontal', 'vertical', 'no-split'].includes(JSON.parse(req.body.pageOptions).split)
      ) {
        return false;
      }
      return true;
    }),
  ],
  async (req: Request, res: Response) => {
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length) {
      res.status(400).json({
        errors: validationErrors,
      });
    } else if (!req.file) {
      res.status(400).json({
        errors: ['No file is posted'],
      });
    } else {
      try {
        const buffer = readFileSync(req.file.path) as Buffer;
        const fileName = cleanString(req.file.originalname.replace('.pdf', ''));
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
      } catch (err) {
        console.log(err);
        res.status(500).json({
          errors: ['An internal error happened'],
        });
      }
    }
  },
);

const imageMiddleware = fileMiddleware('/tmp/pdf', 15000000, ['image/jpeg', 'image/png'], 300);

app.post(
  '/pdf/merge',
  imageMiddleware,
  [body('outputFileName', 'The output file name is invalid').exists().isString().isLength({ min: 1, max: 100 })],
  async (req: Request, res: Response) => {
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length) {
      res.status(400).json({
        errors: validationErrors,
      });
    } else if (req.files && !req.files.length) {
      res.status(400).json({
        errors: ['No file is posted'],
      });
    } else {
      try {
        const files = req.files as Express.Multer.File[];
        const filePaths = files.map((file) => file.path);
        const resultFilePath = await mergeImagesToPdf(filePaths, uuid(), cleanString(req.body.outputFileName));
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
      } catch (err) {
        console.log(err);
        res.status(500).json({
          errors: ['An internal error happened'],
        });
      }
    }
  },
);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
  if (Object.keys(fileMiddlewareErrors).includes(err.message)) {
    return res.status(fileMiddlewareErrors[err.message]).json({ errors: [err.message] });
  } else {
    return res.status(500).json({ errors: [err.message] });
  }
});

export const handler = serverless(app);

export default app;
