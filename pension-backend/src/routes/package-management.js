const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const router = express.Router();

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
    
    // Clean up local file
    fs.unlinkSync(file.path);
    
    console.log('✅ Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed, using local fallback:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    // Return local file path as fallback
    return `/uploads/${file.filename}`;
  }
};

// Get packages for a specific pension
router.get('/pensions/:pensionId/packages', authenticateToken, async (req, res) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    
    // Verify ownership
    const pensionCheck = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    
    if (pensionCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get packages from dedicated packages table
    const packages = await executeQuery(`
      SELECT p.*, 
             (SELECT COUNT(*) 
              FROM rooms r 
              WHERE r.pension_id = p.pension_id 
                AND r.room_type = p.name 
                AND r.availability_status = 'Available') as availableRoomsCount
      FROM packages p
      WHERE p.pension_id = ?
      ORDER BY p.created_at DESC
    `, [pensionId]);
    
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, message: 'Error fetching packages' });
  }
});

// Create new package for a pension
router.post('/pensions/:pensionId/packages', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const packageData = req.body;

    // Upload image to Cloudinary if provided
    let imageUrl = '';
    if (req.file) {
      console.log('📄 Uploading package image:', req.file.filename);
      imageUrl = await uploadToCloudinary(req.file);
      console.log('✅ Package image uploaded to Cloudinary:', imageUrl);
    }

    // Verify ownership
    const pensionCheck = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    
    if (pensionCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // If new package is popular, unset others
    if (packageData.isMostPopular === true) {
      await executeQuery(
        'UPDATE packages SET is_most_popular = 0 WHERE pension_id = ?',
        [pensionId]
      );
    }

    // Insert new package into packages table
    const result = await executeQuery(`
      INSERT INTO packages (pension_id, name, description, price, services, is_most_popular, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      pensionId,
      packageData.name,
      packageData.description,
      packageData.price,
      JSON.stringify(packageData.services || []),
      packageData.isMostPopular ? 1 : 0,
      imageUrl
    ]);

    // Auto-create rooms for the new package
    if (packageData.availableRooms > 0) {
      for (let i = 0; i <packageData.availableRooms; i++) {
        await executeQuery(`
          INSERT INTO rooms (pension_id, owner_id, room_type, price_per_night, availability_status, created_at)
          VALUES (?, ?, ?, ?, 'Available', NOW())
        `, [pensionId, userId, packageData.name, packageData.price]);
      }
    }

    res.json({
      success: true,
      message: 'Package created successfully',
      data: { id: result.insertId, ...packageData }
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, message: 'Error creating package' });
  }
});

// Update existing package
router.put('/pensions/:pensionId/packages/:packageId', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { pensionId, packageId } = req.params;
    const userId = req.user.userId;
    const packageData = req.body;

    // Verify ownership
    const pensionCheck = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    
    if (pensionCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Check if package exists and belongs to this pension
    const packageCheck = await executeQuery(
      'SELECT * FROM packages WHERE package_id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    if (packageCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    // Upload image to Cloudinary if provided
    let imageUrl = packageCheck[0].image_url; // Keep existing image if no new one
    console.log('🔍 Initial imageUrl from database:', imageUrl);
    console.log('🔍 Request file exists:', !!req.file);
    console.log('🔍 PackageData.image:', packageData.image);
    
    // Check if new image file was uploaded
    if (req.file) {
      console.log('📄 Uploading package image for update:', req.file.filename);
      imageUrl = await uploadToCloudinary(req.file);
      console.log('✅ Package image uploaded to Cloudinary:', imageUrl);
    } 
    // Check if image URL was provided in JSON body (for cases where image was uploaded separately)
    else if (packageData.image && packageData.image !== packageCheck[0].image_url) {
      console.log('📄 Using image URL from request body:', packageData.image);
      imageUrl = packageData.image;
    }
    
    console.log('🔍 Final imageUrl to be saved:', imageUrl);
    
    // If package is being set as popular, unset others
    if (packageData.isMostPopular === true) {
      await executeQuery(
        'UPDATE packages SET is_most_popular = 0 WHERE pension_id = ? AND package_id != ?',
        [pensionId, packageId]
      );
    }

    // Update package in packages table
    await executeQuery(`
      UPDATE packages 
      SET name = ?, description = ?, price = ?, services = ?, is_most_popular = ?, image_url = ?
      WHERE package_id = ? AND pension_id = ?
    `, [
      packageData.name,
      packageData.description,
      packageData.price,
      JSON.stringify(packageData.services || []),
      packageData.isMostPopular ? 1 : 0,
      imageUrl,
      packageId,
      pensionId
    ]);

    // Sync rooms table if availableRooms changed
    if (packageData.availableRooms !== undefined) {
      const currentRoomCount = await executeQuery(
        'SELECT COUNT(*) as count FROM rooms WHERE pension_id = ? AND room_type = ?',
        [pensionId, packageCheck[0].name]
      );
      
      const newRoomCount = packageData.availableRooms;
      const currentCount = currentRoomCount[0].count;
      
      if (newRoomCount !== currentCount) {
        if (newRoomCount < currentCount) {
          // Remove excess rooms
          await executeQuery(
            'DELETE FROM rooms WHERE pension_id = ? AND room_type = ? LIMIT ?',
            [pensionId, packageCheck[0].name, currentCount - newRoomCount]
          );
        } else {
          // Add new rooms
          const roomsToAdd = newRoomCount - currentCount;
          for (let i = 0; i < roomsToAdd; i++) {
            await executeQuery(
              'INSERT INTO rooms (pension_id, owner_id, room_type, price_per_night, availability_status, created_at) VALUES (?, ?, ?, ?, \'Available\', NOW())',
              [pensionId, userId, packageData.name, packageData.price]
            );
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { id: packageId, ...packageData }
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({ success: false, message: 'Error updating package' });
  }
});

// Delete package
router.delete('/pensions/:pensionId/packages/:packageId', authenticateToken, async (req, res) => {
  try {
    const { pensionId, packageId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const pensionCheck = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    
    if (pensionCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get package details before deletion
    const packageToDelete = await executeQuery(
      'SELECT * FROM packages WHERE id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    if (packageToDelete.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    // Delete package from packages table
    await executeQuery(
      'DELETE FROM packages WHERE id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    // Also delete corresponding rooms from rooms table
    await executeQuery(
      'DELETE FROM rooms WHERE pension_id = ? AND room_type = ?',
      [pensionId, packageToDelete[0].name]
    );
    
    console.log(`🗑️ Deleted package "${packageToDelete[0].name}" and its rooms from database`);

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({ success: false, message: 'Error deleting package' });
  }
});

module.exports = router;
