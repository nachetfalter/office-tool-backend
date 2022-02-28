import fs from 'fs';
import { makeZipFile, deleteFolders, recreatePath, createPathIfNotExist } from './file';
import { createTestPdf } from './pdf';

const modulePath = './src/utility/__test__';

describe('File', () => {
  describe('makeZipFile', () => {
    it('can make zip file from files in source path and save them to target path', async () => {
      await makeZipFile('test', modulePath, modulePath);
      expect(fs.existsSync(`${modulePath}/test.zip`)).toBeTruthy();
      fs.rmSync(`${modulePath}/test.zip`);
    });
  });

  describe('deleteFolders', () => {
    it('can delete folders and all content under them', async () => {
      createPathIfNotExist(`${modulePath}/test_folder1`);
      createPathIfNotExist(`${modulePath}/test_folder2`);
      deleteFolders(`${modulePath}/test_folder1`, './src/utility/__test__/test_folder2');
      expect(fs.existsSync(`${modulePath}/test_folder1`)).toBeFalsy();
      expect(fs.existsSync(`${modulePath}/test_folder2`)).toBeFalsy();
    });
  });

  describe('recreatePath', () => {
    it('can recreate a directory', async () => {
      createPathIfNotExist(`${modulePath}/test_folder1`);
      await createTestPdf(`${modulePath}/test_folder1/test.pdf`, 'test');
      expect(fs.existsSync(`${modulePath}/test_folder1/test.pdf`)).toBeTruthy();
      recreatePath(`${modulePath}/test_folder1`);
      expect(fs.existsSync(`${modulePath}/test_folder1/test.pdf`)).toBeFalsy();
    });
  });

  describe('createPathIfNotExist', () => {
    it('can create path if not exists', async () => {
      createPathIfNotExist(`${modulePath}/test_folder1`);
      expect(fs.existsSync(`${modulePath}/test_folder1`)).toBeTruthy();
      deleteFolders(`${modulePath}/test_folder1`);
    });
  });
});
