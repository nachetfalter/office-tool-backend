import { Request, Response } from 'express';

export const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  return res;
};

export const mockReq = (body?: Record<string, unknown>, query?: Record<string, unknown>) =>
  ({
    body,
    query,
  } as Request);
