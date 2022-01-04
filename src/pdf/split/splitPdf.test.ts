import fs from 'fs';
import jimp from 'jimp';
import sizeOf from 'image-size';
import { writeImageToFile, convertPdfToImage, subSplitPage, splitPdf } from './splitPdf';
import * as splitPdfModule from './splitPdf';
import * as fileProcessModule from './../../utility/fileProcess';

describe('writeImageToFile', () => {
  afterEach(() => {
    fs.rmSync('./src/pdf/split/__test__/test-page.1.png');
  });

  it('can save image to file and increment counter', async () => {
    const image = new jimp(300, 530, 'green');
    let counter = 1;
    counter = await writeImageToFile('./src/pdf/split/__test__/', 'test-page', image, counter);
    expect(fs.existsSync('./src/pdf/split/__test__/test-page.1.png')).toBeTruthy();
    expect(counter).toBe(2);
  });
});

describe('subSplitPage', () => {
  beforeEach(async () => {
    await fileProcessModule.createPdf('./src/pdf/split/__test__/test.pdf', 'test');
    fileProcessModule.createPathIfNotExist('./src/pdf/split/__test__/original');
    fileProcessModule.createPathIfNotExist('./src/pdf/split/__test__/processed');
    await convertPdfToImage(
      fs.readFileSync('./src/pdf/split/__test__/test.pdf'),
      './src/pdf/split/__test__/original',
      'test-page',
    );
  });

  afterEach(async () => {
    fileProcessModule.deleteFolders('./src/pdf/split/__test__/original', './src/pdf/split/__test__/processed');
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
    await fileProcessModule.createPdf('./src/pdf/split/__test__/test.pdf', 'test');
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
    mockedRecreatePath = jest.spyOn(fileProcessModule, 'recreatePath').mockImplementation(jest.fn());
    mockedDeleteFolders = jest.spyOn(fileProcessModule, 'deleteFolders').mockImplementation(jest.fn());
    mockedConvertPdfToImage = jest.spyOn(splitPdfModule, 'convertPdfToImage').mockImplementation(jest.fn());
    mockedSubSplitPage = jest.spyOn(splitPdfModule, 'subSplitPage').mockImplementation(jest.fn());
    mockedMakeZipFile = jest.spyOn(fileProcessModule, 'makeZipFile').mockImplementation(jest.fn());
    await fileProcessModule.createPdf('./src/pdf/split/__test__/test.pdf', 'test');
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
