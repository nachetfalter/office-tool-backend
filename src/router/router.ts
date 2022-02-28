import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';
import { body, query } from 'express-validator';
import { uploadUrlController } from '../controllers/utilityController';
import { pdfSplitController, pdfMergeController } from '../controllers/pdfController';

const router: Application = express();
router.use(cors());
router.use(bodyParser.json());
dotenv.config();

router.post(
  '/pdf/split',
  body('fileName', 'The file name is not set properly').notEmpty().isString().isLength({ min: 40, max: 41 }),
  body('pageName', 'The page name is not set properly').notEmpty().isString().isLength({ min: 1, max: 100 }),
  body('pageOptions', 'The page option is not set properly').notEmpty(),
  body('pageOptions.split', 'The page split option is invalid')
    .notEmpty()
    .isString()
    .isIn(['horizontal', 'vertical', 'no-split']),
  async (req: Request, res: Response) => {
    return await pdfSplitController(req, res);
  },
);

router.post(
  '/pdf/merge',
  body('fileNames', 'The file names are not set properly').notEmpty().isArray(),
  body('outputFileName', 'The output file name is invalid').notEmpty().isString().isLength({ min: 1, max: 100 }),
  async (req: Request, res: Response) => {
    return await pdfMergeController(req, res);
  },
);

router.get(
  '/uploadUrl',
  query('fileName', 'The file name is invalid').notEmpty().isString().isLength({ min: 40, max: 41 }),
  async (req: Request, res: Response) => {
    await uploadUrlController(req, res);
  },
);

// eslint-disable-next-line
router.use(function (err: Error, _: Request, res: Response, next: NextFunction) {
  return res.status(500).json({ errors: [err.message] });
});

export const handler = serverless(router);

export default router;
