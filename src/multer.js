import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: path.join(__dirname, 'upload'),
    filename: function (req, file, cb) {
      let extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
      cb(null, Date.now() + extension);
    }
  });

const upload = multer({ storage: storage });

export default upload;
