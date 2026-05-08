import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { getMultilingualText } from '../utils/multilingual';
import { RoomStatus } from '@prisma/client';

const router = express.Router();

// Get packages for a specific pension (with real-time room counts)
router.get('/pensions/:pensionId', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { pensionId } = req.params;
    const { language = 'en' } = req.query;
    const pId = parseInt(pensionId as string);
    
    // Get packages and count available rooms for each
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
      }
    });

    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      id: pkg.package_id,
      name: getMultilingualText(pkg.name_ml as any, language as string) || pkg.name,
      description: getMultilingualText(pkg.description_ml as any, language as string) || pkg.description,
      availableRoomsCount: pkg._count.rooms,
      isMostPopular: pkg.is_most_popular
    }));

    res.json({
      success: true,
      data: formattedPackages
    });
  } catch (error: any) {
    next(error);
  }
});

// Get single package details
router.get('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;
    const pId = parseInt(id as string);

    const pkg = await prisma.package.findUnique({
      where: { package_id: pId }
    });

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...pkg,
        id: pkg.package_id,
        name: getMultilingualText(pkg.name_ml as any, language as string) || pkg.name,
        description: getMultilingualText(pkg.description_ml as any, language as string) || pkg.description,
        isMostPopular: pkg.is_most_popular
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// Create new package
router.post('/', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { pension_id, name, description, price, services, is_most_popular, image_url, name_ml, description_ml } = req.body;
    const pId = parseInt(pension_id as string);

    // If this package is marked as most popular, unset others for this pension
    if (is_most_popular) {
      await prisma.package.updateMany({
        where: { pension_id: pId },
        data: { is_most_popular: false }
      });
    }

    const newPackage = await prisma.package.create({
      data: {
        pension_id: pId,
        name,
        description,
        price,
        inclusions: services || [],
        is_most_popular: !!is_most_popular,
        image_url,
        name_ml: name_ml || { en: name },
        description_ml: description_ml || { en: description }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { id: newPackage.package_id }
    });
  } catch (error: any) {
    next(error);
  }
});

// Update package
router.put('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, services, is_most_popular, image_url, name_ml, description_ml } = req.body;
    const pkgId = parseInt(id as string);
    
    const existingPackage = await prisma.package.findUnique({
      where: { package_id: pkgId }
    });

    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    // If this package is marked as most popular, unset others for this pension
    if (is_most_popular) {
      await prisma.package.updateMany({
        where: { pension_id: existingPackage.pension_id },
        data: { is_most_popular: false }
      });
    }

    await prisma.package.update({
      where: { package_id: pkgId },
      data: {
        name: name || existingPackage.name,
        description: description || existingPackage.description,
        price: price !== undefined ? price : existingPackage.price,
        inclusions: services || existingPackage.inclusions,
        is_most_popular: is_most_popular !== undefined ? !!is_most_popular : existingPackage.is_most_popular,
        image_url: image_url || existingPackage.image_url,
        name_ml: name_ml || existingPackage.name_ml,
        description_ml: description_ml || existingPackage.description_ml
      }
    });
    
    res.json({
      success: true,
      message: 'Package updated successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

// Delete package
router.delete('/:id', authenticateToken as any, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const pkgId = parseInt(id as string);

    await prisma.package.delete({
      where: { package_id: pkgId }
    });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
