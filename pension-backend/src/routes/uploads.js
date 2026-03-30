const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to upload file locally
 */
const uploadToCloudinary = async (file) => {
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
  } catch (error) {
    console.error(' Error uploading file:', error);
    throw error;
  }
};

// Test route without authentication for debugging
router.post('/test', upload.single('image'), async (req, res) => {
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
  } catch (error) {
    console.error('Test upload error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Upload a single image
router.post('/single', authenticateToken, upload.single('image'), async (req, res) => {
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
  } catch (error) {
    console.error('Upload error details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

module.exports = router;
