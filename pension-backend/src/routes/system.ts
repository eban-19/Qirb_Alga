import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import fs from 'fs';
import path from 'path';

interface SystemStatus {
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  database: boolean;
  api: boolean;
  storage: boolean;
  lastCheck: string;
  responseTime: number;
}

const getSystemStatus = async (): Promise<SystemStatus> => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const databaseStatus = await checkDatabase();
    
    // Check API functionality
    const apiStatus = await checkAPI();
    
    // Check storage (uploads directory)
    const storageStatus = checkStorage();
    
    const responseTime = Date.now() - startTime;
    
    // Determine overall status
    const allSystemsUp = databaseStatus && apiStatus && storageStatus;
    const someSystemsDown = !databaseStatus || !apiStatus || !storageStatus;
    
    return {
      status: allSystemsUp ? 'online' : someSystemsDown ? 'degraded' : 'offline',
      uptime: process.uptime(),
      database: databaseStatus,
      api: apiStatus,
      storage: storageStatus,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  } catch (error) {
    return {
      status: 'offline',
      uptime: process.uptime(),
      database: false,
      api: false,
      storage: false,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  }
};

const checkDatabase = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

const checkAPI = async (): Promise<boolean> => {
  try {
    // Check if API routes are responsive
    return true; // For now, assume API is working if we can reach this endpoint
  } catch (error) {
    return false;
  }
};

const checkStorage = (): boolean => {
  try {
    const uploadsPath = path.join(__dirname, '../../uploads');
    return fs.existsSync(uploadsPath);
  } catch (error) {
    return false;
  }
};

export const getSystemStatusController = async (req: Request, res: Response) => {
  try {
    const status = await getSystemStatus();
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
