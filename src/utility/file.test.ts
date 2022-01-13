import fs from 'fs';
import { makeZipFile, deleteFolders, recreatePath, createPathIfNotExist } from './file';
import { createTestPdf } from './pdf';

describe('FileProcess', () => {
  describe('makeZipFile', () => {
    it('can make zip file from files in source path and save them to target path', async () => {
      await makeZipFile('test', './src/utility/__test__/', './src/utility/__test__/');
      expect(fs.existsSync('./src/utility/__test__/test.zip')).toBeTruthy();
      fs.rmSync('./src/utility/__test__/test.zip');
    });
  });

  describe('deleteFolders', () => {
    it('can delete folders and all content under them', async () => {
      createPathIfNotExist('./src/utility/__test__/test_folder1');
      createPathIfNotExist('./src/utility/__test__/test_folder2');
      deleteFolders('./src/utility/__test__/test_folder1', './src/utility/__test__/test_folder2');
      expect(fs.existsSync('./src/utility/__test__/test_folder1')).toBeFalsy();
      expect(fs.existsSync('./src/utility/__test__/test_folder2')).toBeFalsy();
    });
  });

  describe('recreatePath', () => {
    it('can recreate a directory', async () => {
      createPathIfNotExist('./src/utility/__test__/test_folder1');
      await createTestPdf('./src/utility/__test__/test_folder1/test.pdf', 'test');
      expect(fs.existsSync('./src/utility/__test__/test_folder1/test.pdf')).toBeTruthy();
      recreatePath('./src/utility/__test__/test_folder1');
      expect(fs.existsSync('./src/utility/__test__/test_folder1/test.pdf')).toBeFalsy();
    });
  });

  describe('createPathIfNotExist', () => {
    it('can create path if not exists', async () => {
      createPathIfNotExist('./src/utility/__test__/test_folder1');
      expect(fs.existsSync('./src/utility/__test__/test_folder1')).toBeTruthy();
      deleteFolders('./src/utility/__test__/test_folder1');
    });
  });
});
