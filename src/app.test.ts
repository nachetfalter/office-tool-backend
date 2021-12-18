import request from 'supertest';
import app from './app';

describe('App', () => {
  describe('GET /', () => {
    it('receives call to root path', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toBe('First commit');
    });
  });
});
