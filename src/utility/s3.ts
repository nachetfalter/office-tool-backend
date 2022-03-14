import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import { Readable } from 'stream';
import { createPathIfNotExist } from './file';

/* istanbul ignore next */
const validateEnvVariables = () => {
  if (!process.env.ACCESS_KEY || !process.env.SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET) {
    throw new Error('AWS credentials, region and/or s3 bucket are not properly defined in .env');
  }
};

/* istanbul ignore next */
const getS3Client = () => {
  validateEnvVariables();

  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY as string,
      secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
    },
  });
};

/* istanbul ignore next */
export const getS3FileStream = async (fileName: string): Promise<Readable | null> => {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName as string,
  });
  const commandResult = await client.send(command);
  return commandResult.Body as Readable;
};

/* istanbul ignore next */
export const createUploadUrl = async (fileName: string) => {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName as string,
    ContentType: 'application/octet-stream',
  });
  return await getSignedUrl(client, command, { expiresIn: 300 });
};

export const downloadFile = async (s3FileName: string, savePath: string): Promise<boolean> => {
  const fileStream = await getS3FileStream(s3FileName);
  if (!fileStream) return false;
  const fileParentPath = savePath.replace(/\/.{36,36}\..*$/, '');
  createPathIfNotExist(fileParentPath);
  const target = fs.createWriteStream(savePath);
  return new Promise((resolve, reject) => {
    fileStream
      .pipe(target)
      .on('error', (err) => {
        console.error('File retrieval from s3 failed', err);
        return reject(false);
      })
      .on('finish', () => resolve(true));
  });
};

/* istanbul ignore next */
export const deleteFile = async (fileName: string) => {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileName as string,
  });
  return client.send(command);
};
