import request from 'supertest';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import fileMiddleware from './fileMiddleware';
import { createTestImage } from '../../src/utility/image';
import { recreatePath } from '../../src/utility/file';

const app: Application = express();
app.use(cors());

const testFileMiddlewareSingle = fileMiddleware('/tmp', 1500, ['application/pdf', 'image/jpeg'], 1);
const testFileMiddlewareMultiple = fileMiddleware('/tmp', 1500, ['application/pdf', 'image/jpeg'], 2);
const testFileMiddleware = fileMiddleware('/tmp', 15000000, ['application/pdf', 'image/jpeg'], 2);

app.post('/test-single', (req: Request, res: Response) => {
  testFileMiddlewareSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
      return;
    } else if (err) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    } else {
      res.status(200).json({ message: 'Everything is awesome' });
    }
  });
});

app.post('/test-multiple', (req: Request, res: Response) => {
  testFileMiddlewareMultiple(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
      return;
    } else if (err) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    } else {
      res.status(200).json({ message: 'Everything is awesome' });
    }
  });
});

app.post('/test', (req: Request, res: Response) => {
  testFileMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
      return;
    } else if (err) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    } else {
      res.status(200).json({ message: 'Everything is awesome' });
    }
  });
});

describe('fileMiddleware', () => {
  for (const testType of ['single', 'multiple']) {
    const fileField = testType === 'single' ? 'file' : 'files';
    it(`rejects the wrong file size when post ${testType} file(s)`, async () => {
      recreatePath('./src/middleware/__test__/');
      await createTestImage('./src/middleware/__test__/testImage1.jpeg');
      await createTestImage('./src/middleware/__test__/testImage2.jpeg');
      await request(app)
        .post(`/test-${testType}`)
        .attach(fileField, './src/middleware/__test__/testImage1.jpeg')
        .attach(fileField, './src/middleware/__test__/testImage2.jpeg')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            error: 'File too large',
          });
        });
      fs.rmSync('./src/middleware/__test__/testImage1.jpeg');
      fs.rmSync('./src/middleware/__test__/testImage2.jpeg');
    });

    it(`rejects the wrong file type when post ${testType} file(s)`, async () => {
      recreatePath('./src/middleware/__test__/');
      await createTestImage('./src/middleware/__test__/testImage1.png');
      await createTestImage('./src/middleware/__test__/testImage2.png');
      await request(app)
        .post(`/test-${testType}`)
        .attach(fileField, './src/middleware/__test__/testImage1.png')
        .attach(fileField, './src/middleware/__test__/testImage2.png')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            error: 'Invalid file type',
          });
        });
      fs.rmSync('./src/middleware/__test__/testImage1.png');
      fs.rmSync('./src/middleware/__test__/testImage2.png');
    });
  }

  it('rejects the upload if the files uploaded exceeds the limit', async () => {
    recreatePath('./src/middleware/__test__/');
    await createTestImage('./src/middleware/__test__/testImage1.jpeg');
    await createTestImage('./src/middleware/__test__/testImage2.jpeg');
    await createTestImage('./src/middleware/__test__/testImage3.jpeg');
    await request(app)
      .post('/test')
      .attach('files', './src/middleware/__test__/testImage1.jpeg')
      .attach('files', './src/middleware/__test__/testImage2.jpeg')
      .attach('files', './src/middleware/__test__/testImage3.jpeg')
      .then(function (response) {
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({
          error: 'Unexpected field',
        });
      });
    fs.rmSync('./src/middleware/__test__/testImage1.jpeg');
    fs.rmSync('./src/middleware/__test__/testImage2.jpeg');
    fs.rmSync('./src/middleware/__test__/testImage3.jpeg');
  });

  it('not throw any error if everything is alright', async () => {
    recreatePath('./src/middleware/__test__/');
    await createTestImage('./src/middleware/__test__/testImage1.jpeg');
    await request(app)
      .post('/test')
      .attach('files', './src/middleware/__test__/testImage1.jpeg')
      .then(function (response) {
        expect(response.statusCode).toBe(200);
      });
    fs.rmSync('./src/middleware/__test__/testImage1.jpeg');
  });
});
