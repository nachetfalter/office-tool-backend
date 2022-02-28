import { mockRes, mockReq } from './expressTestHelper';

describe('expressTestHelper', () => {
  describe('mockRes', () => {
    it('creates a mocked express response', () => {
      const mockedRes = mockRes();
      expect(mockedRes.status).toBeDefined();
      expect(mockedRes.json).toBeDefined();
      expect(mockedRes.send).toBeDefined();
      expect(mockedRes.header).toBeDefined();
    });
  });

  describe('mockReq', () => {
    it('creates a mocked express request with customised body and query', () => {
      expect(mockReq({ bodyField: 1 }, { queryField: 2 })).toEqual({
        body: {
          bodyField: 1,
        },
        query: {
          queryField: 2,
        },
      });
    });
  });
});
