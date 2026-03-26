const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Helper function to upload to Cloudinary and delete local file
 */
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pension-management-system',
    });
    
    // Delete local file after successful upload
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
    
    return result.secure_url;
  } catch (error) {
    // Still try to delete local file on failure
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
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
