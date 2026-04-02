import * as express from 'express';
import upload from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

const router = express.Router();

interface UploadedFile {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Helper function to upload file locally
 */
const uploadToCloudinary = async (file: UploadedFile): Promise<string> => {
  try {
    console.log(' Uploading file locally:', file.filename);
    
    // Ensure uploads directory exists - use correct path
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Move file to uploads directory
    const localPath = path.join(uploadsDir, file.filename);
    fs.renameSync(file.path, localPath);
    
    console.log(' File saved locally:', localPath);
    
    // Return local file URL
    return `/uploads/${file.filename}`;
  } catch (error: any) {
    console.error(' Error uploading file:', error);
    throw error;
  }
};

// Test route without authentication for debugging
router.post('/test', upload.single('image'), async (req: any, res: express.Response) => {
  try {
    console.log('Test upload route hit');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const cloudUrl = await uploadToCloudinary(req.file);

    res.json({
      success: true,
      message: 'File uploaded to Cloudinary successfully',
      data: {
        filename: req.file.filename,
        url: cloudUrl,
        size: req.file.size
      }
    });
  } catch (error: any) {
    console.error('Test upload error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Upload a single image
router.post('/single', authenticateToken as any, upload.single('image'), async (req: any, res: express.Response) => {
  try {
    console.log('Authenticated upload route hit');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const cloudUrl = await uploadToCloudinary(req.file);

    res.json({
      success: true,
      message: 'File uploaded to Cloudinary successfully',
      data: {
        filename: req.file.filename,
        url: cloudUrl,
        size: req.file.size
      }
    });
  } catch (error: any) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

export default router;
