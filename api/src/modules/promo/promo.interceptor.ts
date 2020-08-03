import { diskStorage } from 'multer';
import { extname } from 'path';
import { IRequest } from '../shared/interfaces/express.interface';
import { IFile, TCallback } from '../shared/interfaces/multer.interface';
export default {
  storage: diskStorage({
    destination: './public/promos',
    filename: (req, file, cb) => {
      const randomName = Math.floor(Date.now() / 1000).toString();
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 5000000,
  },
  fileFilter: (req: IRequest, file: IFile, cb: TCallback): void => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
};
