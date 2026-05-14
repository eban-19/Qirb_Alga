import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Initialize default settings if they don't exist
const initializeSettings = async () => {
  const defaults = [
    { key: 'VAT_PERCENTAGE', value: '15', description: 'Value Added Tax percentage' },
    { key: 'SERVICE_FEE_PERCENTAGE', value: '5', description: 'Service fee percentage for bookings' }
  ];

  for (const setting of defaults) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key }
    });

    if (!existing) {
      await prisma.systemSetting.create({
        data: setting
      });
      console.log(`✅ Initialized setting: ${setting.key}=${setting.value}`);
    }
  }
};

// Get all system settings (Public for VAT/Service Fee)
router.get('/settings', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.json({ success: true, data: settingsMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get raw settings (Admin only)
router.get('/settings/raw', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' }
    });
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update settings (Admin only)
router.put('/settings', authenticateToken as any, requireAdmin as any, async (req: express.Request, res: express.Response) => {
  const { settings } = req.body; // Expecting { key: value }
  
  try {
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings format' });
    }

    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      );
    }

    await prisma.$transaction(updates);
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Run initialization
initializeSettings().catch(err => console.error('Failed to initialize system settings:', err));

export const getSystemStatusController = async (req: express.Request, res: express.Response) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => 'Connected').catch(() => 'Disconnected');
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date(),
      database: dbStatus,
      uptime: process.uptime()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default router;
