import { diskStorage } from 'multer';
import { extname } from 'path';

export const logoMulterConfig = {
  storage: diskStorage({
    destination: './uploads/logos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
    },
  }),
};
