import request from 'supertest';
import { createPdf } from './utility/fileProcess';
import * as splitPdfModule from './pdf/split/splitPdf';
import app from './app';

describe('App', () => {
  describe('POST /pdf/split', () => {
    it('receives call and returns 200 if everything is alright', async () => {
      await createPdf('./src/__test__/test.pdf', 'test');
      jest.spyOn(splitPdfModule, 'splitPdf').mockImplementation(() => Promise.resolve('./src/__test__/test.pdf'));
      await request(app)
        .post('/pdf/split')
        .field('pageName', 'testPage')
        .field('pageOptions', '{"split": "default"}')
        .attach('file', './src/__test__/test.pdf')
        .then(function (response) {
          expect(response.statusCode).toBe(200);
        });
    });
  });
});
