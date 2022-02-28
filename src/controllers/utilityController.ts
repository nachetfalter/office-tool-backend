import { Request, Response } from 'express';
import { makeGenericController } from '../utility/controller';
import { createUploadUrl } from '../utility/s3';

export const uploadUrlController = async (req: Request, res: Response) => {
  await makeGenericController(req, res, async (req, res) => {
    const fileName = req.query.fileName as string;
    const uploadUrl = await createUploadUrl(fileName);
    res.status(200).json({ uploadUrl });
  });
};
