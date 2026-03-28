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
    console.log('🔍 Upload attempt for file:', file.filename);
    console.log('🔍 Cloudinary config check:');
    console.log('  - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ SET' : '❌ MISSING');
    console.log('  - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
    console.log('  - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('❌ Cloudinary not configured, returning local file path');
      // Return a local file URL as fallback
      return `/uploads/${file.filename}`;
    }

    console.log('🚀 Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pension-management-system',
    });
    
    console.log('✅ Cloudinary upload successful:', result.secure_url);
    
    // Delete local file after successful upload
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed, using local fallback:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    // Return local file path as fallback
    return `/uploads/${file.filename}`;
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
  console.log('🔍 UPLOAD ROUTE HIT - This should always appear');
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Request user:', req.user);
  console.log('🔍 Request file:', req.file);
  
  try {
    console.log('🔍 Authenticated upload route hit');
    
    if (!req.file) {
      console.log('🔍 No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('🚀 Starting Cloudinary upload for:', req.file.path);
    const cloudUrl = await uploadToCloudinary(req.file);
    console.log('✅ Upload completed, URL:', cloudUrl);

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
    console.error('❌ Upload route error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request file info:', req.file);
    console.error('❌ Request user info:', req.user);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});

// Add middleware-level debugging
const uploadMiddleware = (req, res, next) => {
  console.log('🔍 UPLOAD MIDDLEWARE HIT');
  console.log('🔍 Request headers:', req.headers);
  console.log('🔍 Request method:', req.method);
  console.log('🔍 Request URL:', req.url);
  
  // Check for common upload issues
  if (req.method === 'OPTIONS') {
    console.log('🔍 OPTIONS request detected');
    return res.status(200).end();
  }
  
  // Check content type
  const contentType = req.headers['content-type'];
  console.log('🔍 Content-Type:', contentType);
  
  if (contentType && !contentType.includes('multipart/form-data')) {
    console.log('🔍 Invalid content type for upload');
    return res.status(400).json({ success: false, message: 'Invalid content type' });
  }
  
  next();
};

// Apply middleware debugging
router.use(uploadMiddleware);

module.exports = router;
