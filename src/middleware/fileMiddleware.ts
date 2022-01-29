import multer from 'multer';
import path from 'path';
import { createPathIfNotExist } from './../utility/file';

const fileMiddleWare = (savePath: string, fileSizeInBytes: number, fileTypes: Array<string>, numberOfFiles: number) => {
  createPathIfNotExist(savePath);
  const storage = multer.diskStorage({
    destination: savePath,
    filename: function (_, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });

  const middleware = multer({
    storage: storage,
    limits: {
      fileSize: fileSizeInBytes,
    },
    fileFilter: function (_, file, cb) {
      if (!fileTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'));
      }
      return cb(null, true);
    },
  });

  if (numberOfFiles === 1) {
    return middleware.single('file');
  } else {
    return middleware.array('files', numberOfFiles);
  }
};

export default fileMiddleWare;
