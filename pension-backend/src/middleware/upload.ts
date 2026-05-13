import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req: any, file: any, cb: any) => {
    // Broaden regex to match common image/document patterns more safely
    const filetypes = /jpeg|jpg|png|webp|pdf|gif|heic|heif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    
    const isMimeValid = filetypes.test(mimetype);
    const isExtValid = filetypes.test(ext);

    console.log(`[UPLOAD DEBUG] File: ${file.originalname}, Mime: ${mimetype}, Ext: ${ext}, MimeValid: ${isMimeValid}, ExtValid: ${isExtValid}`);

    if (isMimeValid || isExtValid) {
      return cb(null, true);
    }
    cb(new Error(`File type not allowed! (Type: ${mimetype}, Extension: ${ext}). Only images and PDFs are supported.`));
  }
});

export default upload;
