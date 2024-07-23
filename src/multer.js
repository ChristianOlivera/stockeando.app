import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgDir = path.join(__dirname, 'public/img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: imgDir,
    filename: function (req, file, cb) {
        let extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, Date.now() + extension);
    }
});

const upload = multer({ storage: storage });

export default upload;
