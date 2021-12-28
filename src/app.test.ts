import request from 'supertest';
import * as splitPdfModule from './pdf/split/splitPdf';
import app from './app';

describe('App', () => {
  describe('POST /pdf/split', () => {
    it('receives call to the', async () => {
      jest
        .spyOn(splitPdfModule, 'splitPdf')
        .mockImplementation(() => Promise.resolve('./src/testResource/pdf/test.pdf'));
      await request(app)
        .post('/pdf/split')
        .field('pageName', 'testPage')
        .field('pageOptions', '{"split": "default"}')
        .attach('file', './src/testResource/pdf/test.pdf')
        .then(function (response) {
          console.log(response.status);
          expect(response.statusCode).toBe(200);
        });
    }, 30000);
  });
});
