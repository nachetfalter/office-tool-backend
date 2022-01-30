import request from 'supertest';
import fs from 'fs';
import { createTestPdf } from './utility/pdf';
import { createTestImage } from './utility/image';
import { recreatePath } from './utility/file';
import * as splitPdfModule from './pdf/split/splitPdf';
import * as mergeImagesToPdfModule from './pdf/merge/mergeImagesToPdf';
import app from './app';

describe('App', () => {
  describe('POST /pdf/split', () => {
    it('receives call and returns 200 if everything is alright', async () => {
      recreatePath('./src/__test__/');
      await createTestPdf('./src/__test__/test.pdf', 'test');
      jest.spyOn(splitPdfModule, 'splitPdf').mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/split')
        .field('pageName', 'testPage')
        .field('pageOptions', '{"split": "no-split"}')
        .attach('file', './src/__test__/test.pdf')
        .then(function (response) {
          expect(response.statusCode).toBe(200);
        });
      expect(fs.existsSync('./src/__test__/test.pdf')).toBe(false);
    });

    it('rejects invalid file upload', async () => {
      jest.spyOn(splitPdfModule, 'splitPdf').mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/split')
        .field('pageName', 'testPage')
        .field('pageOptions', '{"split": "no-split"}')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            errors: ['No file is posted'],
          });
        });
    });

    it('rejects invalid inputs and return a list of errors', async () => {
      recreatePath('./src/__test__/');
      await createTestPdf('./src/__test__/test.pdf', 'test');
      jest.spyOn(splitPdfModule, 'splitPdf').mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/split')
        .attach('file', './src/__test__/test.pdf')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            errors: [
              'The page name is not set or is invalid',
              'The page option is not set properly',
              'The page split option is invalid',
            ],
          });
        });
      fs.rmSync('./src/__test__/test.pdf');
    });

    it('catches internal server error', async () => {
      recreatePath('./src/__test__/');
      await createTestPdf('./src/__test__/test.pdf', 'test');
      jest.spyOn(splitPdfModule, 'splitPdf').mockImplementation(() => {
        throw new Error('testError');
      });
      await request(app)
        .post('/pdf/split')
        .field('pageName', 'testPage')
        .field('pageOptions', '{"split": "no-split"}')
        .attach('file', './src/__test__/test.pdf')
        .then(function (response) {
          expect(response.statusCode).toBe(500);
          expect(response.body).toStrictEqual({
            errors: ['An internal error happened'],
          });
        });
      fs.rmSync('./src/__test__/test.pdf');
    });
  });

  describe('POST /pdf/merge', () => {
    it('receives call and returns 200 if everything is alright', async () => {
      recreatePath('./src/__test__/');
      await createTestImage('./src/__test__/testImage1.png');
      await createTestImage('./src/__test__/testImage2.png');
      await createTestPdf('./src/__test__/test.pdf', 'test');
      jest
        .spyOn(mergeImagesToPdfModule, 'mergeImagesToPdf')
        .mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/merge')
        .field('outputFileName', 'testFile')
        .attach('files', './src/__test__/testImage1.png')
        .attach('files', './src/__test__/testImage2.png')
        .then(function (response) {
          expect(response.statusCode).toBe(200);
        });
      expect(fs.existsSync('./src/__test__/test.pdf')).toBe(false);
      fs.rmSync('./src/__test__/testImage1.png');
      fs.rmSync('./src/__test__/testImage2.png');
    });

    it('rejects invalid file upload', async () => {
      jest
        .spyOn(mergeImagesToPdfModule, 'mergeImagesToPdf')
        .mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/merge')
        .field('outputFileName', 'testFile')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            errors: ['No file is posted'],
          });
        });
    });

    it('rejects invalid inputs and return a list of errors', async () => {
      recreatePath('./src/__test__/');
      await createTestImage('./src/__test__/testImage1.png');
      await createTestImage('./src/__test__/testImage2.png');
      jest
        .spyOn(mergeImagesToPdfModule, 'mergeImagesToPdf')
        .mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/merge')
        .attach('files', './src/__test__/testImage1.png')
        .attach('files', './src/__test__/testImage2.png')
        .then(function (response) {
          expect(response.statusCode).toBe(400);
          expect(response.body).toStrictEqual({
            errors: ['The output file name is invalid'],
          });
        });
      fs.rmSync('./src/__test__/testImage1.png');
      fs.rmSync('./src/__test__/testImage2.png');
    });

    it('catches internal server error', async () => {
      recreatePath('./src/__test__/');
      await createTestImage('./src/__test__/testImage1.png');
      await createTestImage('./src/__test__/testImage2.png');
      jest.spyOn(mergeImagesToPdfModule, 'mergeImagesToPdf').mockImplementation(() => {
        throw new Error('testError');
      });
      await request(app)
        .post('/pdf/merge')
        .field('outputFileName', 'testFile')
        .attach('files', './src/__test__/testImage1.png')
        .attach('files', './src/__test__/testImage2.png')
        .then(function (response) {
          expect(response.statusCode).toBe(500);
          expect(response.body).toStrictEqual({
            errors: ['An internal error happened'],
          });
        });
      fs.rmSync('./src/__test__/testImage1.png');
      fs.rmSync('./src/__test__/testImage2.png');
    });
  });
});
