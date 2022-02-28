import { Request, Response } from 'express';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { splitPdfToImages } from '../services/pdf/split/splitPdfToImages';
import { mergeImagesToPdf } from '../services/pdf/merge/mergeImagesToPdf';
import { cleanString } from '../utility/string';
import { downloadFile, deleteFile } from '../utility/s3';
import { createPathIfNotExist } from '../utility/file';
import { makeGenericController } from '../utility/controller';

createPathIfNotExist('/tmp/pdf/split');
createPathIfNotExist('/tmp/pdf/merge');

export const pdfSplitController = async (req: Request, res: Response) => {
  await makeGenericController(req, res, async (req, res) => {
    try {
      const s3FileName = req.body.fileName;
      const s3FileId = s3FileName.replace('.pdf', '');
      const fileDownloadedSuccessfully = await downloadFile(s3FileName, `/tmp/pdf/split/${s3FileId}/${s3FileName}`);

      if (fileDownloadedSuccessfully) {
        console.log(`Entering split function with file id ${s3FileId}`);
        const outputFilePath = await splitPdfToImages(s3FileId, cleanString(req.body.pageName), req.body.pageOptions);
        const outputFileContentInBase64 = fs.readFileSync(outputFilePath).toString('base64');
        res
          .header({
            'Content-Type': 'application/octet-stream',
            isBase64Encoded: true,
          })
          .status(200)
          .send(outputFileContentInBase64);
        await deleteFile(s3FileName);
        fs.rmSync(outputFilePath.replace(`/${s3FileId}.zip`, ''), { recursive: true });
      } else {
        console.log('S3 file download failed in pdfSplitController');
        res.status(500).json({
          errors: ['An internal error happened'],
        });
        return;
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.log(errorMessage);
      if (errorMessage === 'The document is encrypted and cannot be operated on') {
        res.status(400).json({
          errors: [errorMessage],
        });
      } else {
        res.status(500).json({
          errors: ['An internal error happened'],
        });
      }
    }
  });
};

export const pdfMergeController = async (req: Request, res: Response) => {
  await makeGenericController(req, res, async (req, res) => {
    try {
      const s3FileNames = req.body.fileNames;
      const filePaths = [];
      const jobId = uuid();

      for (const s3FileName of s3FileNames) {
        const fileDownloadedSuccessfully = await downloadFile(s3FileName, `/tmp/pdf/merge/${jobId}/${s3FileName}`);
        if (fileDownloadedSuccessfully) {
          filePaths.push(`/tmp/pdf/merge/${jobId}/${s3FileName}`);
        } else {
          console.log('S3 file download failed in pdfMergeController');
          res.status(500).json({
            errors: ['An internal error happened'],
          });
          return;
        }
      }

      const cleanedOutputFileName = cleanString(req.body.outputFileName);
      const outputFilePath = await mergeImagesToPdf(filePaths, `/tmp/pdf/merge/${jobId}`, cleanedOutputFileName);
      const outputFileContentInBase64 = fs.readFileSync(outputFilePath).toString('base64');
      res
        .header({
          'Content-Type': 'application/octet-stream',
          isBase64Encoded: true,
        })
        .status(200)
        .send(outputFileContentInBase64);

      await Promise.all(s3FileNames.map((s3FileName: string) => deleteFile(s3FileName)));
      fs.rmSync(outputFilePath.replace(`/${cleanedOutputFileName}.pdf`, ''), { recursive: true });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: ['An internal error happened'],
      });
    }
  });
};
