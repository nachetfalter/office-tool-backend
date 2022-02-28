import { mockReq, mockRes } from '../utility/expressTestHelper';
import * as s3Module from '../utility/s3';
import fs from 'fs';
import * as uuid from 'uuid';
import * as splitPdfToImagesModule from '../services/pdf/split/splitPdfToImages';
import * as mergeImagesToPdfModule from '../services/pdf/merge/mergeImagesToPdf';
import { pdfSplitController, pdfMergeController } from './pdfController';

jest.mock('fs');
jest.mock('uuid');
const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedUuid = uuid as jest.Mocked<typeof uuid>;

describe('pdfController', () => {
  let mockedRmSync: any;

  beforeAll(() => {
    mockedRmSync = mockedFs.rmSync.mockReturnValue();
    jest.spyOn(s3Module, 'deleteFile').mockImplementation();
  });

  describe('pdfSplitController', () => {
    let mockedReq: any;
    let mockedSplitPdfToImages: any;
    let mockedReadFileSync: any;

    beforeAll(() => {
      mockedReq = mockReq({
        fileName: '00cf297a-dcd7-44f3-8bf8-3891144472d5.pdf',
        pageName: 'page',
        pageOptions: {
          split: 'no-split',
        },
      });
      mockedSplitPdfToImages = jest
        .spyOn(splitPdfToImagesModule, 'splitPdfToImages')
        .mockResolvedValue('testFolder/00cf297a-dcd7-44f3-8bf8-3891144472d5.zip');
      mockedReadFileSync = mockedFs.readFileSync.mockReturnValue(Buffer.from('binaryFile'));
    });

    it('returns 200 if everything goes well', async () => {
      const mockedDownloadFile = jest.spyOn(s3Module, 'downloadFile').mockResolvedValue(true);
      const mockedRes = mockRes();
      await pdfSplitController(mockedReq, mockedRes);
      expect(mockedDownloadFile).toBeCalledWith(
        '00cf297a-dcd7-44f3-8bf8-3891144472d5.pdf',
        '/tmp/pdf/split/00cf297a-dcd7-44f3-8bf8-3891144472d5/00cf297a-dcd7-44f3-8bf8-3891144472d5.pdf',
      );
      expect(mockedSplitPdfToImages).toBeCalledWith('00cf297a-dcd7-44f3-8bf8-3891144472d5', 'page', {
        split: 'no-split',
      });
      expect(mockedReadFileSync).toBeCalledWith('testFolder/00cf297a-dcd7-44f3-8bf8-3891144472d5.zip');
      expect(mockedRmSync).toBeCalledWith('testFolder', { recursive: true });
      expect(mockedRes.status).toBeCalledWith(200);
      expect(mockedRes.send).toBeCalledWith(Buffer.from('binaryFile').toString('base64'));
    });

    it('returns 500 if the s3 file download failed', async () => {
      jest.spyOn(s3Module, 'downloadFile').mockResolvedValue(false);
      const mockedRes = mockRes();
      await pdfSplitController(mockedReq, mockedRes);
      expect(mockedRes.status).toBeCalledWith(500);
      expect(mockedRes.json).toBeCalledWith({
        errors: ['An internal error happened'],
      });
    });

    it('returns 400 if the "file encrypted" error is thrown', async () => {
      jest
        .spyOn(s3Module, 'downloadFile')
        .mockRejectedValue(new Error('The document is encrypted and cannot be operated on'));
      const mockedRes = mockRes();
      await pdfSplitController(mockedReq, mockedRes);
      expect(mockedRes.status).toBeCalledWith(400);
      expect(mockedRes.json).toBeCalledWith({
        errors: ['The document is encrypted and cannot be operated on'],
      });
    });

    it('returns 500 if any other non specific error is thrown', async () => {
      jest.spyOn(s3Module, 'downloadFile').mockRejectedValue(new Error('error'));
      const mockedRes = mockRes();
      await pdfSplitController(mockedReq, mockedRes);
      expect(mockedRes.status).toBeCalledWith(500);
      expect(mockedRes.json).toBeCalledWith({
        errors: ['An internal error happened'],
      });
    });
  });

  describe('pdfMergeController', () => {
    let mockedReq: any;
    let mockedMergeImagesToPdf: any;
    let mockedReadFileSync: any;

    beforeAll(() => {
      mockedReq = mockReq({
        fileNames: ['00cf297a-dcd7-44f3-8bf8-3891144472d5.png'],
        outputFileName: 'testFile',
      });
      mockedUuid.v4.mockReturnValue('b2d57020-8fa4-4823-9d00-b9fbf8caf114');
      mockedMergeImagesToPdf = jest
        .spyOn(mergeImagesToPdfModule, 'mergeImagesToPdf')
        .mockResolvedValue('testFolder/testFile.pdf');
      mockedReadFileSync = mockedFs.readFileSync.mockReturnValue(Buffer.from('binaryFile'));
    });

    it('returns 200 if everything goes well', async () => {
      const mockedDownloadFile = jest.spyOn(s3Module, 'downloadFile').mockResolvedValue(true);
      const mockedRes = mockRes();
      await pdfMergeController(mockedReq, mockedRes);
      expect(mockedDownloadFile).toBeCalledWith(
        '00cf297a-dcd7-44f3-8bf8-3891144472d5.png',
        '/tmp/pdf/merge/b2d57020-8fa4-4823-9d00-b9fbf8caf114/00cf297a-dcd7-44f3-8bf8-3891144472d5.png',
      );
      expect(mockedMergeImagesToPdf).toBeCalledWith(
        ['/tmp/pdf/merge/b2d57020-8fa4-4823-9d00-b9fbf8caf114/00cf297a-dcd7-44f3-8bf8-3891144472d5.png'],
        '/tmp/pdf/merge/b2d57020-8fa4-4823-9d00-b9fbf8caf114',
        'testFile',
      );
      expect(mockedReadFileSync).toBeCalledWith('testFolder/testFile.pdf');
      expect(mockedRmSync).toBeCalledWith('testFolder', { recursive: true });
      expect(mockedRes.status).toBeCalledWith(200);
      expect(mockedRes.send).toBeCalledWith(Buffer.from('binaryFile').toString('base64'));
    });

    it('returns 500 if the s3 file download failed', async () => {
      jest.spyOn(s3Module, 'downloadFile').mockResolvedValue(false);
      const mockedRes = mockRes();
      await pdfMergeController(mockedReq, mockedRes);
      expect(mockedRes.status).toBeCalledWith(500);
      expect(mockedRes.json).toBeCalledWith({
        errors: ['An internal error happened'],
      });
    });

    it('returns 500 if any non specific error is thrown', async () => {
      jest.spyOn(s3Module, 'downloadFile').mockRejectedValue(new Error('error'));
      const mockedRes = mockRes();
      await pdfMergeController(mockedReq, mockedRes);
      expect(mockedRes.status).toBeCalledWith(500);
      expect(mockedRes.json).toBeCalledWith({
        errors: ['An internal error happened'],
      });
    });
  });
});
