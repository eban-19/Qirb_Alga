const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Get packages for a specific pension
router.get('/pensions/:pensionId/packages', authenticateToken, async (req, res) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Get packages from pension record (JSON column)
    let packages = [];
    if (pension[0].packages) {
      try {
        packages = typeof pension[0].packages === 'string' 
          ? JSON.parse(pension[0].packages) 
          : pension[0].packages;
      } catch (error) {
        console.error('Error parsing packages:', error);
        packages = [];
      }
    }

    res.json({
      success: true,
      data: packages
    });

  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new package for a pension
router.post('/pensions/:pensionId/packages', authenticateToken, async (req, res) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const packageData = req.body;

    // Verify ownership
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Get existing packages
    let existingPackages = [];
    if (pension[0].packages) {
      try {
        existingPackages = typeof pension[0].packages === 'string' 
          ? JSON.parse(pension[0].packages) 
          : pension[0].packages;
      } catch (error) {
        console.error('Error parsing packages:', error);
        existingPackages = [];
      }
    }
    
    // Add new package
    let updatedPackages = [...existingPackages];
    
    // If new package is popular, unset others
    if (packageData.isMostPopular === true) {
      updatedPackages = updatedPackages.map(pkg => ({ ...pkg, isMostPopular: false }));
    }

    const newPackage = {
      id: Date.now().toString(),
      ...packageData,
      created_at: new Date().toISOString()
    };

    updatedPackages.push(newPackage);

    // Update pension with new packages
    await executeQuery(
      'UPDATE pensions SET packages = ? WHERE pension_id = ? AND owner_id = ?',
      [JSON.stringify(updatedPackages), pensionId, userId]
    );

    // Auto-create rooms for the new package
    if (packageData.availableRooms > 0) {
      for (let i = 0; i < packageData.availableRooms; i++) {
        await executeQuery(`
          INSERT INTO rooms (pension_id, owner_id, room_type, price_per_night, availability_status, created_at)
          VALUES (?, ?, ?, ?, 'Available', NOW())
        `, [pensionId, userId, packageData.name, packageData.price]);
      }
      console.log(`Created ${packageData.availableRooms} rooms for package ${packageData.name}`);
    }

    res.json({
      success: true,
      data: newPackage,
      message: 'Package created successfully'
    });

  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update existing package
router.put('/pensions/:pensionId/packages/:packageId', authenticateToken, async (req, res) => {
  try {
    const { pensionId, packageId } = req.params;
    const userId = req.user.userId;
    const packageData = req.body;

    // Verify ownership
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Get existing packages
    let existingPackages = [];
    if (pension[0].packages) {
      try {
        existingPackages = typeof pension[0].packages === 'string' 
          ? JSON.parse(pension[0].packages) 
          : pension[0].packages;
      } catch (error) {
        console.error('Error parsing packages:', error);
        existingPackages = [];
      }
    }
    
    // Find and update specific package
    const updatedPackages = existingPackages.map(pkg => {
      if (pkg.id === packageId) {
        return { ...pkg, ...packageData, updated_at: new Date().toISOString() };
      }
      // If we are setting this package as most popular, unset others
      if (packageData.isMostPopular === true) {
        return { ...pkg, isMostPopular: false };
      }
      return pkg;
    });

    // Get the updated package to check room changes
    const updatedPackage = updatedPackages.find(pkg => pkg.id === packageId);
    const oldPackage = existingPackages.find(pkg => pkg.id === packageId);

    // Sync rooms table if availableRooms changed
    if (updatedPackage && oldPackage && updatedPackage.availableRooms !== oldPackage.availableRooms) {
      // Get current rooms for this package
      const currentRooms = await executeQuery(
        'SELECT COUNT(*) as count FROM rooms WHERE pension_id = ? AND room_type = ?',
        [pensionId, updatedPackage.name]
      );
      
      const currentRoomCount = currentRooms[0].count;
      const newRoomCount = updatedPackage.availableRooms || 0;
      
      if (newRoomCount > currentRoomCount) {
        // Add more rooms
        const roomsToAdd = newRoomCount - currentRoomCount;
        for (let i = 0; i < roomsToAdd; i++) {
          await executeQuery(
            'INSERT INTO rooms (pension_id, owner_id, room_type, price_per_night, availability_status, created_at) VALUES (?, ?, ?, ?, \'Available\', NOW())',
            [pensionId, userId, updatedPackage.name, updatedPackage.price]
          );
        }
        console.log(`Added ${roomsToAdd} rooms for package ${updatedPackage.name}`);
      } else if (newRoomCount < currentRoomCount) {
        // Remove excess rooms (set to unavailable instead of deleting)
        const roomsToRemove = currentRoomCount - newRoomCount;
        await executeQuery(
          'UPDATE rooms SET availability_status = \'Unavailable\' WHERE pension_id = ? AND room_type = ? AND availability_status = \'Available\' LIMIT ?',
          [pensionId, updatedPackage.name, roomsToRemove]
        );
        console.log(`Marked ${roomsToRemove} rooms as unavailable for package ${updatedPackage.name}`);
      }
    }

    // Update pension with updated packages
    await executeQuery(
      'UPDATE pensions SET packages = ? WHERE pension_id = ? AND owner_id = ?',
      [JSON.stringify(updatedPackages), pensionId, userId]
    );

    res.json({
      success: true,
      data: updatedPackage,
      message: 'Package updated successfully'
    });

  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete package
router.delete('/pensions/:pensionId/packages/:packageId', authenticateToken, async (req, res) => {
  try {
    const { pensionId, packageId } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Get existing packages
    let existingPackages = [];
    if (pension[0].packages) {
      try {
        existingPackages = typeof pension[0].packages === 'string' 
          ? JSON.parse(pension[0].packages) 
          : pension[0].packages;
      } catch (error) {
        console.error('Error parsing packages:', error);
        existingPackages = [];
      }
    }
    
    // Remove the specific package
    const updatedPackages = existingPackages.filter(pkg => pkg.id !== packageId);

    // Update pension with updated packages
    await executeQuery(
      'UPDATE pensions SET packages = ? WHERE pension_id = ? AND owner_id = ?',
      [JSON.stringify(updatedPackages), pensionId, userId]
    );

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
