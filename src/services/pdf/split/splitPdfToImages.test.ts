import fs from 'fs';
import sizeOf from 'image-size';
import { writeImageToFile, subSplitPage, splitPdfToImages } from './splitPdfToImages';
import { createTestPdf, convertPdfToImage } from '../../../utility/pdf';
import * as pdfModule from '../../../utility/pdf';
import { createTestImage } from '../../../utility/image';
import * as splitPdfModule from './splitPdfToImages';
import * as fileUtilityModule from '../../../utility/file';

describe('writeImageToFile', () => {
  afterEach(() => {
    fs.rmSync('./src/services/pdf/split/__test__/test-page.1.png');
  });

  it('can save image to file and increment counter', async () => {
    const image = await createTestImage();
    let counter = 1;
    counter = await writeImageToFile('./src/services/pdf/split/__test__/', 'test-page', image, counter);
    expect(fs.existsSync('./src/services/pdf/split/__test__/test-page.1.png')).toBeTruthy();
    expect(counter).toBe(2);
  });
});

describe('subSplitPage', () => {
  beforeEach(async () => {
    await createTestPdf('./src/services/pdf/split/__test__/test.pdf', 'test');
    fileUtilityModule.createPathIfNotExist('./src/services/pdf/split/__test__/original');
    fileUtilityModule.createPathIfNotExist('./src/services/pdf/split/__test__/processed');
    await convertPdfToImage(
      './src/services/pdf/split/__test__/test.pdf',
      './src/services/pdf/split/__test__/original',
      'test-page',
    );
  });

  afterEach(async () => {
    fileUtilityModule.deleteFolders(
      './src/services/pdf/split/__test__/original',
      './src/services/pdf/split/__test__/processed',
    );
    fs.rmSync('./src/services/pdf/split/__test__/test.pdf');
  });

  it('can sub-split images vertically', async () => {
    await subSplitPage(
      './src/services/pdf/split/__test__/original',
      './src/services/pdf/split/__test__/processed',
      'test-page',
      'vertical',
    );
    expect(fs.existsSync('./src/services/pdf/split/__test__/processed/test-page.1.png')).toBe(true);
    expect(fs.existsSync('./src/services/pdf/split/__test__/processed/test-page.2.png')).toBe(true);
    const { width, height } = sizeOf('./src/services/pdf/split/__test__/processed/test-page.1.png');
    expect(width).toBe(800);
    expect(height).toBe(300);
  });

  it('can sub-split images horizontally', async () => {
    await subSplitPage(
      './src/services/pdf/split/__test__/original',
      './src/services/pdf/split/__test__/processed',
      'test-page',
      'horizontal',
    );
    expect(fs.existsSync('./src/services/pdf/split/__test__/processed/test-page.1.png')).toBeTruthy();
    expect(fs.existsSync('./src/services/pdf/split/__test__/processed/test-page.2.png')).toBeTruthy();

    const { width, height } = sizeOf('./src/services/pdf/split/__test__/processed/test-page.1.png');
    expect(width).toBe(400);
    expect(height).toBe(600);
  });
});

describe('splitPdf main function', () => {
  let mockedRecreatePath: any;
  let mockedDeleteFolders: any;
  let mockedConvertPdfToImage: any;
  let mockedSubSplitPage: any;
  let mockedMakeZipFile: any;

  beforeEach(async () => {
    mockedRecreatePath = jest.spyOn(fileUtilityModule, 'recreatePath').mockImplementation(jest.fn());
    mockedDeleteFolders = jest.spyOn(fileUtilityModule, 'deleteFolders').mockImplementation(jest.fn());
    mockedConvertPdfToImage = jest.spyOn(pdfModule, 'convertPdfToImage').mockImplementation(jest.fn());
    mockedSubSplitPage = jest.spyOn(splitPdfModule, 'subSplitPage').mockImplementation(jest.fn());
    mockedMakeZipFile = jest.spyOn(fileUtilityModule, 'makeZipFile').mockImplementation(jest.fn());
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('can split a pdf with default page option', async () => {
    await splitPdfToImages('754315fb-4183-4ba8-960a-a0cb80d4fd5d', 'test-page', {
      split: 'no-split',
    });
    expect(mockedRecreatePath).toBeCalledTimes(1);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith(
      '754315fb-4183-4ba8-960a-a0cb80d4fd5d',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/original',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d',
    );
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).not.toBeCalled();
  });

  it('can split a pdf with horizontal split page option', async () => {
    await splitPdfToImages('754315fb-4183-4ba8-960a-a0cb80d4fd5d', 'test-page', {
      split: 'horizontal',
    });
    expect(mockedRecreatePath).toBeCalledTimes(2);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith(
      '754315fb-4183-4ba8-960a-a0cb80d4fd5d',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/processed',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d',
    );
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).toBeCalledWith(
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/original',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/processed',
      'test-page',
      'horizontal',
    );
  });

  it('can split a pdf with vertical split page option', async () => {
    await splitPdfToImages('754315fb-4183-4ba8-960a-a0cb80d4fd5d', 'test-page', {
      split: 'vertical',
    });
    expect(mockedRecreatePath).toBeCalledTimes(2);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith(
      '754315fb-4183-4ba8-960a-a0cb80d4fd5d',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/processed',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d',
    );
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).toBeCalledWith(
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/original',
      '/tmp/pdf/split/754315fb-4183-4ba8-960a-a0cb80d4fd5d/processed',
      'test-page',
      'vertical',
    );
  });
});
