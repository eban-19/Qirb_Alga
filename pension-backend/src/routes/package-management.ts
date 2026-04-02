import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import upload from '../middleware/upload';
import * as fs from 'fs';
import * as path from 'path';

const router = express.Router();

interface PackageData {
  name: string;
  description: string;
  price: number;
  services: any[];
  isMostPopular: boolean;
  image?: string;
}

interface UploadedFile {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Helper function to upload to Cloudinary and delete local file
 */
const uploadToCloudinary = async (file: UploadedFile): Promise<string> => {
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

    // Dynamic import for cloudinary (only when needed)
    const cloudinary = require('cloudinary').v2;
    
    console.log('🚀 Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pension-management-system',
    });
    
    // Clean up local file
    fs.unlinkSync(file.path);
    
    console.log('✅ Cloudinary upload successful:', result.secure_url);
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Cloudinary upload failed, using local fallback:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    // Return local file path as fallback
    return `/uploads/${file.filename}`;
  }
};

// Get packages for a specific pension
router.get('/pensions/:pensionId/packages', authenticateToken as any, async (req: any, res: express.Response) => {
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
    
    console.log('🔍 Packages loaded from database:', packages.map((p: any) => ({
      package_id: p.package_id,
      name: p.name,
      is_most_popular: p.is_most_popular,
      is_most_popular_type: typeof p.is_most_popular
    })));
    
    res.json({
      success: true,
      data: packages
    });
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, message: 'Error fetching packages' });
  }
});

// Create new package for a pension
router.post('/pensions/:pensionId/packages', authenticateToken as any, upload.single('image'), async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const packageData: PackageData = req.body;

    // Upload image locally if provided
    let imageUrl = '';
    if (req.file) {
      console.log('📄 Uploading package image locally:', req.file.filename);
      imageUrl = await uploadToCloudinary(req.file);
      console.log('✅ Package image saved locally:', imageUrl);
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

    res.json({
      success: true,
      message: 'Package created successfully',
      data: { id: result.insertId, ...packageData }
    });
  } catch (error: any) {
    console.error('Error creating package:', error);
    res.status(500).json({ success: false, message: 'Error creating package' });
  }
});

// Update existing package
router.put('/pensions/:pensionId/packages/:packageId', authenticateToken as any, upload.single('image'), async (req: any, res: express.Response) => {
  try {
    const { pensionId, packageId } = req.params;
    const userId = req.user.userId;
    const packageData: PackageData = req.body;

    console.log('🔍 Package update request:', {
      pensionId,
      packageId,
      userId,
      packageData,
      bodyKeys: Object.keys(req.body),
      hasFile: !!req.file
    });

    // Verify ownership
    const pensionCheck = await executeQuery(
      'SELECT pension_id FROM pensions WHERE pension_id = ? AND owner_id = ?',
      [pensionId, userId]
    );
    
    if (pensionCheck.length === 0) {
      console.error('❌ Access denied for pension:', pensionId, 'user:', userId);
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Check if package exists and belongs to this pension
    const packageCheck = await executeQuery(
      'SELECT * FROM packages WHERE package_id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    if (packageCheck.length === 0) {
      console.error('❌ Package not found:', packageId, 'for pension:', pensionId);
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    console.log('🔍 Package found in database:', packageCheck[0]);
    
    // Upload image to Cloudinary if provided
    let imageUrl = packageCheck[0].image_url; // Keep existing image if no new one
    console.log('🔍 Initial imageUrl from database:', imageUrl);
    console.log('🔍 Request file exists:', !!req.file);
    console.log('🔍 PackageData.image:', packageData.image);
    
    // Check if new image file was uploaded
    if (req.file) {
      console.log('📄 Uploading package image for update:', req.file.filename);
      imageUrl = await uploadToCloudinary(req.file);
      console.log('✅ Package image saved locally:', imageUrl);
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

    // Build dynamic update query - only update fields that are provided
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (packageData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(packageData.name);
    }
    if (packageData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(packageData.description);
    }
    if (packageData.price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(packageData.price);
    }
    if (packageData.services !== undefined) {
      updateFields.push('services = ?');
      updateValues.push(JSON.stringify(packageData.services));
    }
    if (packageData.isMostPopular !== undefined) {
      updateFields.push('is_most_popular = ?');
      updateValues.push(packageData.isMostPopular ? 1 : 0);
    }
    if (imageUrl !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(imageUrl);
    }
    
    // Always add WHERE clause values
    updateValues.push(packageId, pensionId);

    console.log('🔍 Executing dynamic database update:', {
      updateFields,
      updateValues,
      sqlQuery: `UPDATE packages SET ${updateFields.join(', ')} WHERE package_id = ? AND pension_id = ?`
    });

    // Update package in packages table
    await executeQuery(`
      UPDATE packages 
      SET ${updateFields.join(', ')}
      WHERE package_id = ? AND pension_id = ?
    `, updateValues);

    console.log('✅ Package updated successfully in database');
    
    // Verify the update by reading the package back
    const verifyPackage = await executeQuery(
      'SELECT * FROM packages WHERE package_id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    console.log('🔍 Verification - Package in DB after update:', verifyPackage[0]);

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { id: packageId, ...packageData }
    });
  } catch (error: any) {
    console.error('Error updating package:', error);
    res.status(500).json({ success: false, message: 'Error updating package' });
  }
});

// Delete package
router.delete('/pensions/:pensionId/packages/:packageId', authenticateToken as any, async (req: any, res: express.Response) => {
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
      'SELECT * FROM packages WHERE package_id = ? AND pension_id = ?',
      [packageId, pensionId]
    );
    
    if (packageToDelete.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    // Delete package from packages table
    await executeQuery(
      'DELETE FROM packages WHERE package_id = ? AND pension_id = ?',
      [packageId, pensionId]
    );

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    res.status(500).json({ success: false, message: 'Error deleting package' });
  }
});

export default router;
