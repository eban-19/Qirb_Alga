import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import upload from '../middleware/upload';
import * as fs from 'fs';
import { RoomStatus } from '@prisma/client';

const router = express.Router();

interface PackageData {
  name: string;
  description: string;
  price: any; // Use any to handle string from frontend
  services: any[];
  isMostPopular: boolean;
  image?: string;
  images?: string[];
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
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return `/uploads/${file.filename}`;
    }

    // Dynamic import for cloudinary (only when needed)
    const cloudinary = require('cloudinary').v2;
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pension-management-system',
    });
    
    // Clean up local file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return result.secure_url;
  } catch (error: any) {
    console.error('❌ Cloudinary upload failed, using local fallback:', error);
    return `/uploads/${file.filename}`;
  }
};

// Get packages for a specific pension
router.get('/pensions/:pensionId/packages', authenticateToken as any, async (req: any, res: express.Response) => {
  try {
    const { pensionId } = req.params;
    const userId = req.user.userId;
    const pId = parseInt(pensionId as string);
    
    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pId, owner_id: userId }
    });
    
    if (!pension) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get packages from dedicated packages table
    const packages = await prisma.package.findMany({
      where: { pension_id: pId },
      include: {
        _count: {
          select: {
            rooms: {
              where: { availability_status: RoomStatus.Available }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      availableRoomsCount: (pkg as any)._count.rooms
    }));
    
    res.json({
      success: true,
      data: formattedPackages
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
    const pId = parseInt(pensionId as string);

    // Upload image locally if provided
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    }

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pId, owner_id: userId }
    });
    
    if (!pension) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Use transaction if setting as most popular
    const result = await prisma.$transaction(async (tx) => {
      if (packageData.isMostPopular === true) {
        await tx.package.updateMany({
          where: { pension_id: pId },
          data: { is_most_popular: false }
        });
      }

      return await tx.package.create({
        data: {
          pension_id: pId,
          name: packageData.name,
          description: packageData.description,
          price: parseFloat(packageData.price) || 0,
          inclusions: packageData.services || [],
          is_most_popular: !!packageData.isMostPopular,
          image_url: imageUrl || (packageData.images && packageData.images.length > 0 ? packageData.images[0] : ''),
          images: packageData.images || [],
          name_ml: { en: packageData.name },
          description_ml: { en: packageData.description }
        }
      });
    });

    res.json({
      success: true,
      message: 'Package created successfully',
      data: { id: result.package_id, ...packageData }
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
    const pId = parseInt(pensionId as string);
    const pkgId = parseInt(packageId as string);

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pId, owner_id: userId }
    });
    
    if (!pension) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Check if package exists and belongs to this pension
    const existingPackage = await prisma.package.findUnique({
      where: { package_id: pkgId, pension_id: pId }
    });
    
    if (!existingPackage) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    // Upload image to Cloudinary if provided
    let imageUrl = existingPackage.image_url;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file);
    } else if (packageData.image && packageData.image !== existingPackage.image_url) {
      imageUrl = packageData.image;
    }
    
    // Use transaction for updates
    const result = await prisma.$transaction(async (tx) => {
      // If package is being set as popular, unset others
      if (packageData.isMostPopular === true) {
        await tx.package.updateMany({
          where: { pension_id: pId, package_id: { not: pkgId } },
          data: { is_most_popular: false }
        });
      }

      return await tx.package.update({
        where: { package_id: pkgId },
        data: {
          name: packageData.name !== undefined ? packageData.name : existingPackage.name,
          description: packageData.description !== undefined ? packageData.description : existingPackage.description,
          price: packageData.price !== undefined ? parseFloat(packageData.price) : existingPackage.price,
          inclusions: (packageData.services !== undefined ? packageData.services : existingPackage.inclusions) as any,
          is_most_popular: packageData.isMostPopular !== undefined ? !!packageData.isMostPopular : existingPackage.is_most_popular,
          image_url: imageUrl || (packageData.images && packageData.images.length > 0 ? packageData.images[0] : existingPackage.image_url),
          images: packageData.images !== undefined ? packageData.images : (existingPackage.images as any),
          name_ml: (packageData.name !== undefined ? { en: packageData.name } : existingPackage.name_ml) as any,
          description_ml: (packageData.description !== undefined ? { en: packageData.description } : existingPackage.description_ml) as any
        }
      });
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { id: pkgId, ...packageData }
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
    const pId = parseInt(pensionId as string);
    const pkgId = parseInt(packageId as string);

    // Verify ownership
    const pension = await prisma.pension.findUnique({
      where: { pension_id: pId, owner_id: userId }
    });
    
    if (!pension) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Check if package exists
    const packageToDelete = await prisma.package.findUnique({
      where: { package_id: pkgId, pension_id: pId }
    });
    
    if (!packageToDelete) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    
    // Delete package
    await prisma.package.delete({
      where: { package_id: pkgId }
    });

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
