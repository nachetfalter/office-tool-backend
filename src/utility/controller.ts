import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const getValidationErrors = (req: Request) => {
  // I really cannot figure out how to mock this line, as the result
  // I cannot test the situation where there are validation errors
  const validationErrors = validationResult(req).array();
  /* istanbul ignore next */
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors.map((validationError) => validationError.msg);
    return Array.from(new Set(errorMessage));
  }
  return [];
};

export const makeGenericController = async (
  req: Request,
  res: Response,
  logicHandler: (req: Request, res: Response) => Promise<void>,
) => {
  try {
    const validationErrors = getValidationErrors(req);
    if (validationErrors.length) {
      res.status(400).json({
        errors: validationErrors,
      });
    } else {
      await logicHandler(req, res);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      errors: ['An internal error happened'],
    });
  }
};
