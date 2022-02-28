import { makeGenericController, getValidationErrors } from './controller';
import { mockRes, mockReq } from './expressTestHelper';
import * as controllerModule from './controller';

const logicHandler = jest.fn();

export const mockedReq = mockReq({
  field: 'test',
});

describe('controller', () => {
  describe('getValidationErrors', () => {
    it('returns an empty array if there is no validation error', () => {
      jest.mock('express-validator');
      expect(getValidationErrors(mockedReq)).toEqual([]);
    });
  });

  describe('makeGenericController', () => {
    it('sets status 400 with the validation errors if there are any validation errors', async () => {
      jest.spyOn(controllerModule, 'getValidationErrors').mockReturnValueOnce(['error1', 'error2']);
      const mockedRes = mockRes();
      await makeGenericController(mockedReq, mockedRes, logicHandler);
      expect(mockedRes.json).toBeCalledWith({ errors: ['error1', 'error2'] });
      expect(mockedRes.status).toBeCalledWith(400);
    });

    it('sets status 500 with an internal error message if there is an internal error', async () => {
      jest.spyOn(controllerModule, 'getValidationErrors').mockImplementation(() => {
        throw new Error();
      });
      const mockedRes = mockRes();
      await makeGenericController(mockedReq, mockedRes, logicHandler);
      expect(mockedRes.json).toBeCalledWith({ errors: ['An internal error happened'] });
      expect(mockedRes.status).toBeCalledWith(500);
    });

    it('calls the handler function when there is no error', async () => {
      jest.spyOn(controllerModule, 'getValidationErrors').mockReturnValueOnce([]);
      const mockedRes = mockRes();
      await makeGenericController(mockedReq, mockedRes, logicHandler);
      expect(logicHandler).toHaveBeenCalled();
    });
  });
});
