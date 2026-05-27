import express from 'express';
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
import { createSubaccount } from '../services/chapaService';
import axios from 'axios';

const router = express.Router();

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get Chapa Providers
router.get('/admin/chapa-providers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const authHeader = `Bearer ${process.env.CHAPA_SECRET_KEY}`;
    const response = await axios.get('https://api.chapa.co/v1/banks', {
      headers: {
        Authorization: authHeader,
      },
    });
    res.json({ success: true, providers: response.data.data });
  } catch (error: any) {
    console.error('Error fetching Chapa providers:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch Chapa providers' });
  }
});

// Get all payout methods
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const methods = await prisma.payoutMethod.findMany({
      include: { fields: true },
    });
    res.json({ success: true, methods });
  } catch (error) {
    console.error('Error fetching payout methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new payout method
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, type, provider_code, is_active, fields } = req.body;
    
    const method = await prisma.payoutMethod.create({
      data: {
        name,
        type,
        provider_code: String(provider_code),
        is_active,
        fields: {
          create: fields?.map((f: any) => ({
            name: f.name,
            label: f.label,
            type: f.type,
            is_required: f.is_required !== undefined ? f.is_required : true
          })) || []
        }
      },
      include: { fields: true }
    });
    
    res.json({ success: true, method });
  } catch (error) {
    console.error('Error creating payout method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update payout method
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, type, provider_code, is_active, fields } = req.body;
    
    // Update basic info
    await prisma.payoutMethod.update({
      where: { id },
      data: { name, type, provider_code: String(provider_code), is_active }
    });

    // Update fields (delete and recreate for simplicity)
    if (fields && Array.isArray(fields)) {
      await prisma.payoutMethodField.deleteMany({ where: { payout_method_id: id } });
      await prisma.payoutMethodField.createMany({
        data: fields.map((f: any) => ({
          payout_method_id: id,
          name: f.name,
          label: f.label,
          type: f.type,
          is_required: f.is_required !== undefined ? f.is_required : true
        }))
      });
    }

    const updatedMethod = await prisma.payoutMethod.findUnique({
      where: { id },
      include: { fields: true }
    });

    res.json({ success: true, method: updatedMethod });
  } catch (error) {
    console.error('Error updating payout method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete payout method
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.payoutMethod.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payout method:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// OWNER ROUTES
// ==========================================

// Get active payout methods and fields available for owners to create accounts
router.get('/owner/methods/active', authenticateToken, async (req, res) => {
  try {
    const methods = await prisma.payoutMethod.findMany({
      where: { is_active: true },
      include: { fields: true }
    });
    res.json({ success: true, methods });
  } catch (error) {
    console.error('Error fetching active payout methods:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get owner's configured payout accounts
router.get('/owner/accounts', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const accounts = await prisma.ownerPayoutAccount.findMany({
      where: { owner_id: userId },
      include: {
        payout_method: true
      }
    });
    res.json({ success: true, accounts });
  } catch (error) {
    console.error('Error fetching owner accounts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new payout account
router.post('/owner/accounts', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { payout_method_id, account_details } = req.body;

    const method = await prisma.payoutMethod.findUnique({
      where: { id: parseInt(payout_method_id) }
    });

    if (!method || !method.is_active) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive payout method' });
    }

    // Check if this is the first account for the owner to set as active automatically
    const existingAccounts = await prisma.ownerPayoutAccount.count({
      where: { owner_id: userId }
    });
    const isFirstAccount = existingAccounts === 0;

    // Fetch dynamic service fee percentage
    const systemSetting = await prisma.systemSetting.findUnique({ where: { key: 'SERVICE_FEE_PERCENTAGE' } });
    const serviceFeePercentage = systemSetting ? parseFloat(systemSetting.value) : 5;
    const ownerPercentage = (100 - serviceFeePercentage) / 100;

    const ownerProfile = await prisma.ownerProfile.findUnique({ where: { owner_id: userId } });
    
    // Map regular CBE production UUID to Wegagen Bank sandbox ID 472 under Sandbox Mode to avoid bank code error
    let bankCodeForChapa = method.provider_code;
    const isSandbox = process.env.CHAPA_SECRET_KEY?.includes('_TEST') || false;
    if (isSandbox && method.provider_code === '80a510ea-7497-4499-8b49-ce13a0b7095c') {
      bankCodeForChapa = '472';
    }

    // Try creating Chapa subaccount
    let chapaSubaccountId = '';
    try {
      const subaccountData = {
        business_name: ownerProfile?.business_name || account_details.accountName || 'Owner Business',
        account_name: account_details.accountName || ownerProfile?.business_name || 'Account Name',
        bank_code: bankCodeForChapa,
        account_number: account_details.accountNumber || account_details.phoneNumber || '000',
        split_type: 'percentage' as const,
        split_value: ownerPercentage
      };
      
      const chapaRes = await createSubaccount(subaccountData);
      if (chapaRes.status === 'success' && chapaRes.data) {
        chapaSubaccountId = chapaRes.data['subaccounts[id]'] || chapaRes.data.subaccount_id || chapaRes.data.id;
      }
    } catch (error: any) {
      console.warn('Chapa Subaccount Creation Warning:', error.message);
      // We still create the DB entry even if Chapa fails (maybe Sandbox issues)
      // but you might want to handle it differently in production
    }

    const account = await prisma.ownerPayoutAccount.create({
      data: {
        owner_id: userId,
        payout_method_id: parseInt(payout_method_id),
        account_details,
        is_active: isFirstAccount,
        chapa_subaccount_id: chapaSubaccountId 
      },
      include: { payout_method: true }
    });

    res.json({ success: true, account });
  } catch (error) {
    console.error('Error creating owner payout account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Set a payout account as active (primary)
router.put('/owner/accounts/:id/active', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const accountId = parseInt(req.params.id);

    // Verify ownership
    const account = await prisma.ownerPayoutAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Unset current active
    await prisma.ownerPayoutAccount.updateMany({
      where: { owner_id: userId, is_active: true },
      data: { is_active: false }
    });

    // Set new active
    const updatedAccount = await prisma.ownerPayoutAccount.update({
      where: { id: accountId },
      data: { is_active: true },
      include: { payout_method: true }
    });

    res.json({ success: true, account: updatedAccount });
  } catch (error) {
    console.error('Error setting active account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a payout account
router.delete('/owner/accounts/:id', authenticateToken, requireRole(['owner', 'admin']), async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const accountId = parseInt(req.params.id);

    const account = await prisma.ownerPayoutAccount.findUnique({
      where: { id: accountId }
    });

    if (!account || account.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await prisma.ownerPayoutAccount.delete({
      where: { id: accountId }
    });

    // If active account was deleted, pick another to be active if exists
    if (account.is_active) {
      const nextAccount = await prisma.ownerPayoutAccount.findFirst({
        where: { owner_id: userId }
      });
      if (nextAccount) {
        await prisma.ownerPayoutAccount.update({
          where: { id: nextAccount.id },
          data: { is_active: true }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
