import fs from 'fs';
import sizeOf from 'image-size';
import { writeImageToFile, convertPdfToImage, subSplitPage, splitPdf } from './splitPdf';
import { createTestPdf } from '../../utility/pdf';
import { createTestImage } from '../../utility/image';
import * as splitPdfModule from './splitPdf';
import * as fileUtilityModule from '../../utility/file';

describe('writeImageToFile', () => {
  afterEach(() => {
    fs.rmSync('./src/pdf/split/__test__/test-page.1.png');
  });

  it('can save image to file and increment counter', async () => {
    const image = await createTestImage();
    let counter = 1;
    counter = await writeImageToFile('./src/pdf/split/__test__/', 'test-page', image, counter);
    expect(fs.existsSync('./src/pdf/split/__test__/test-page.1.png')).toBeTruthy();
    expect(counter).toBe(2);
  });
});

describe('subSplitPage', () => {
  beforeEach(async () => {
    await createTestPdf('./src/pdf/split/__test__/test.pdf', 'test');
    fileUtilityModule.createPathIfNotExist('./src/pdf/split/__test__/original');
    fileUtilityModule.createPathIfNotExist('./src/pdf/split/__test__/processed');
    await convertPdfToImage(
      fs.readFileSync('./src/pdf/split/__test__/test.pdf'),
      './src/pdf/split/__test__/original',
      'test-page',
    );
  });

  afterEach(async () => {
    fileUtilityModule.deleteFolders('./src/pdf/split/__test__/original', './src/pdf/split/__test__/processed');
    fs.rmSync('./src/pdf/split/__test__/test.pdf');
  });

  it('can sub-split images vertically', async () => {
    await subSplitPage(
      './src/pdf/split/__test__/original',
      './src/pdf/split/__test__/processed',
      'test-page',
      'vertical',
    );
    expect(fs.existsSync('./src/pdf/split/__test__/processed/test-page.1.png')).toBeTruthy();
    expect(fs.existsSync('./src/pdf/split/__test__/processed/test-page.2.png')).toBeTruthy();

    const { width, height } = sizeOf('./src/pdf/split/__test__/processed/test-page.1.png');
    expect(width).toBe(800);
    expect(height).toBe(300);
  });

  it('can sub-split images horizontally', async () => {
    await subSplitPage(
      './src/pdf/split/__test__/original',
      './src/pdf/split/__test__/processed',
      'test-page',
      'horizontal',
    );
    expect(fs.existsSync('./src/pdf/split/__test__/processed/test-page.1.png')).toBeTruthy();
    expect(fs.existsSync('./src/pdf/split/__test__/processed/test-page.2.png')).toBeTruthy();

    const { width, height } = sizeOf('./src/pdf/split/__test__/processed/test-page.1.png');
    expect(width).toBe(400);
    expect(height).toBe(600);
  });
});

describe('convertPdfToImage', () => {
  afterEach(() => {
    fs.rmSync('./src/pdf/split/__test__/test-page.1.png');
    fs.rmSync('./src/pdf/split/__test__/test.pdf');
  });

  it('can convert pdf to image', async () => {
    await createTestPdf('./src/pdf/split/__test__/test.pdf', 'test');
    await convertPdfToImage(
      fs.readFileSync('./src/pdf/split/__test__/test.pdf'),
      './src/pdf/split/__test__/',
      'test-page',
    );
    expect(fs.existsSync('./src/pdf/split/__test__/test-page.1.png')).toBeTruthy();
  });
});

describe('splitPdf main function', () => {
  let mockedRecreatePath: jest.SpyInstance<void, [path: string]>;
  let mockedDeleteFolders: jest.SpyInstance<void, string[]>;
  let mockedConvertPdfToImage: jest.SpyInstance<
    Promise<void>,
    [fileBuffer: Buffer, savePath: string, pageName: string]
  >;
  let mockedSubSplitPage: jest.SpyInstance<
    Promise<void>,
    [originalFilePath: string, processedFilePath: string, pageName: string, splitOption: 'vertical' | 'horizontal']
  >;
  let mockedMakeZipFile: jest.SpyInstance<Promise<unknown>, [fileName: string, sourcePath: string, targetPath: string]>;

  beforeEach(async () => {
    mockedRecreatePath = jest.spyOn(fileUtilityModule, 'recreatePath').mockImplementation(jest.fn());
    mockedDeleteFolders = jest.spyOn(fileUtilityModule, 'deleteFolders').mockImplementation(jest.fn());
    mockedConvertPdfToImage = jest.spyOn(splitPdfModule, 'convertPdfToImage').mockImplementation(jest.fn());
    mockedSubSplitPage = jest.spyOn(splitPdfModule, 'subSplitPage').mockImplementation(jest.fn());
    mockedMakeZipFile = jest.spyOn(fileUtilityModule, 'makeZipFile').mockImplementation(jest.fn());
    await createTestPdf('./src/pdf/split/__test__/test.pdf', 'test');
  });

  afterEach(async () => {
    fs.rmSync('./src/pdf/split/__test__/test.pdf');
    jest.clearAllMocks();
  });

  it('can split a pdf with default page option', async () => {
    await splitPdf('test.pdf', 'testfile', fs.readFileSync('./src/pdf/split/__test__/test.pdf'), 'test-page', {
      split: 'no-split',
    });
    expect(mockedRecreatePath).toBeCalledTimes(1);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith('test.pdf', '/tmp/pdf/split/testfile/original', '/tmp/pdf/split/testfile');
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).not.toBeCalled();
  });

  it('can split a pdf with horizontal split page option', async () => {
    await splitPdf('test.pdf', 'testfile', fs.readFileSync('./src/pdf/split/__test__/test.pdf'), 'test-page', {
      split: 'horizontal',
    });
    expect(mockedRecreatePath).toBeCalledTimes(2);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith(
      'test.pdf',
      '/tmp/pdf/split/testfile/processed',
      '/tmp/pdf/split/testfile',
    );
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).toBeCalledWith(
      '/tmp/pdf/split/testfile/original',
      '/tmp/pdf/split/testfile/processed',
      'test-page',
      'horizontal',
    );
  });

  it('can split a pdf with vertical split page option', async () => {
    await splitPdf('test.pdf', 'testfile', fs.readFileSync('./src/pdf/split/__test__/test.pdf'), 'test-page', {
      split: 'vertical',
    });
    expect(mockedRecreatePath).toBeCalledTimes(2);
    expect(mockedConvertPdfToImage).toBeCalledTimes(1);
    expect(mockedMakeZipFile).toBeCalledWith(
      'test.pdf',
      '/tmp/pdf/split/testfile/processed',
      '/tmp/pdf/split/testfile',
    );
    expect(mockedDeleteFolders).toBeCalledTimes(1);
    expect(mockedSubSplitPage).toBeCalledWith(
      '/tmp/pdf/split/testfile/original',
      '/tmp/pdf/split/testfile/processed',
      'test-page',
      'vertical',
    );
  });
});
