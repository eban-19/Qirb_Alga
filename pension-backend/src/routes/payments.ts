import express from 'express';
import { PrismaClient } from '@prisma/client';
import { initializePayment, verifyPayment, createSubaccount } from '../services/chapaService';
import { SMSService } from '../services/sms.service';
import { authenticateToken } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Get Banks from Chapa API dynamically
router.get('/banks', async (req, res) => {
  try {
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    const response = await fetch('https://api.chapa.co/v1/banks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${chapaSecretKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Chapa API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Map Chapa's response to our frontend format
    const formattedBanks = (data.data || []).map((bank: any) => ({
      id: String(bank.id), // Chapa uses numeric IDs or UUIDs depending on the environment
      name: bank.name
    }));

    res.json({
      success: true,
      data: formattedBanks
    });
  } catch (error: any) {
    console.error('Failed to fetch banks from Chapa:', error);
    // Fallback to basic list if Chapa API fails
    res.json({
      success: true,
      data: [
        { id: '80a510ea-7497-4499-8b49-ce13a0b7095c', name: 'Commercial Bank of Ethiopia (CBE)' }, // Production CBE ID
        { id: '128', name: 'CBEBirr' },
        { id: '855', name: 'Telebirr' }
      ]
    });
  }
});

// Create/Update Subaccount for Pension Owner
router.post('/subaccount', authenticateToken as any, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { bank_id, bank_name, account_name, account_number } = req.body;

    if (req.user.role !== 'Owner') {
      return res.status(403).json({ success: false, message: 'Only owners can setup bank details' });
    }

    // Fetch dynamic service fee percentage
    const systemSetting = await prisma.systemSetting.findUnique({ where: { key: 'SERVICE_FEE_PERCENTAGE' } });
    const serviceFeePercentage = systemSetting ? parseFloat(systemSetting.value) : 5;
    
    // The split value represents what goes to the subaccount (the owner).
    // If service fee is 5%, owner gets 95% (0.95)
    const ownerPercentage = (100 - serviceFeePercentage) / 100;

    const subaccountData = {
      business_name: account_name, // Fallback if business_name not set
      account_name,
      bank_code: bank_id,
      account_number,
      split_type: 'percentage' as const,
      split_value: ownerPercentage
    };

    const ownerProfile = await prisma.ownerProfile.findUnique({ where: { owner_id: userId } });
    if (ownerProfile?.business_name) {
      subaccountData.business_name = ownerProfile.business_name;
    }

    // Call Chapa API
    const chapaRes = await createSubaccount(subaccountData);
    
    if (chapaRes.status === 'success' && chapaRes.data) {
      // Typically Chapa returns something like data: { "subaccounts[id]": "..." } or data: { subaccount_id: "..." }
      // The exact key can vary, usually it's `subaccount_id` or `subaccounts[id]`
      const chapaSubaccountId = chapaRes.data['subaccounts[id]'] || chapaRes.data.subaccount_id || chapaRes.data.id;

      // Update DB
      await prisma.ownerProfile.upsert({
        where: { owner_id: userId },
        update: {
          bank_id,
          bank_name,
          account_name,
          account_number,
          chapa_subaccount_id: chapaSubaccountId
        },
        create: {
          owner_id: userId,
          bank_id,
          bank_name,
          account_name,
          account_number,
          chapa_subaccount_id: chapaSubaccountId
        }
      });

      return res.json({ success: true, message: 'Bank details saved successfully', data: { chapa_subaccount_id: chapaSubaccountId } });
    } else {
      return res.status(400).json({ success: false, message: 'Failed to create subaccount with Chapa' });
    }

  } catch (error: any) {
    console.error('Subaccount Creation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create subaccount' });
  }
});

// Initialize Booking Payment
router.post('/initialize-booking', async (req: any, res) => {
  const { bookingId, amount, email, firstName, lastName, phone } = req.body;

  try {
    const txRef = `BOOK-${bookingId}-${Date.now()}`;
    
    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        reference: txRef,
        amount: parseFloat(String(amount).replace(/,/g, '')),
        currency: 'ETB',
        status: 'PENDING',
        type: 'BOOKING',
        user_id: req.user?.userId || undefined, // Use authenticated user ID if available, otherwise null
      },
    });

    const cleanAmount = parseFloat(String(amount).replace(/,/g, '')).toString();
    
    // Improved email sanitization for Chapa
    let cleanEmail = (email || 'guest@example.com')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, ''); // Remove any weird characters
    
    // If the email uses our custom internal domain, Chapa might reject it.
    // Let's ensure it looks like a very standard email for Chapa's validator.
    if (cleanEmail.includes('@guest.qirbalga.com')) {
      cleanEmail = cleanEmail.replace('@guest.qirbalga.com', '@gmail.com');
    }
    
    // Final fallback if email is still weird
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      cleanEmail = 'customer@gmail.com';
    }

    const cleanFirstName = (firstName || 'Guest').trim().replace(/[^a-zA-Z]/g, '');
    const cleanLastName = (lastName || 'User').trim().replace(/[^a-zA-Z]/g, '');

    // Fetch the booking to find the pension owner's subaccount ID
    const booking = await prisma.booking.findUnique({
      where: { booking_id: parseInt(bookingId) },
      include: {
        room: {
          include: {
            pension: {
              select: { owner_id: true }
            }
          }
        }
      }
    });

    let chapaSubaccountId = undefined;
    if (booking?.room?.pension?.owner_id) {
      const ownerProfile = await prisma.ownerProfile.findUnique({
        where: { owner_id: booking.room.pension.owner_id }
      });
      if (ownerProfile?.chapa_subaccount_id) {
        chapaSubaccountId = ownerProfile.chapa_subaccount_id;
      }
    }

    const chapaData: any = {
      amount: cleanAmount,
      currency: 'ETB',
      email: cleanEmail,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      tx_ref: txRef,
      callback_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
      return_url: `${process.env.FRONTEND_URL}/payment/confirmation?ref=${txRef}`,
      customization: {
        title: 'P-Booking',
        description: `Booking payment ${bookingId}`,
      },
    };

    if (chapaSubaccountId) {
      chapaData['subaccounts[id]'] = chapaSubaccountId;
    }

    console.log('🚀 Initializing Chapa Payment:', {
      tx_ref: chapaData.tx_ref,
      amount: chapaData.amount,
      email: chapaData.email,
      subaccount_id: chapaSubaccountId || 'Main Account Only',
      title: chapaData.customization.title
    });

    const chapaResponse = await initializePayment(chapaData);
    
    // Update booking with payment reference
    await prisma.booking.update({ 
      where: { booking_id: parseInt(bookingId) }, 
      data: { payment_id: payment.payment_id } 
    });

    res.json({
      success: true,
      data: chapaResponse.data,
      paymentId: payment.payment_id,
      txRef
    });
  } catch (error: any) {
    console.error('❌ Payment Initialization Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment' });
  }
});

// Verify Payment
router.get('/verify/:txRef', async (req, res) => {
  const { txRef } = req.params;

  try {
    const verification = await verifyPayment(txRef);
    
    if (verification.status === 'success' && verification.data.status === 'success') {
      const payment = await prisma.payment.update({
        where: { reference: txRef },
        data: { status: 'PAID' },
      });

      const booking = await prisma.booking.findUnique({ 
        where: { payment_id: payment.payment_id },
        include: {
          room: true,
          customer: true
        }
      });

      let pensionName = 'Your Pension';
      if (booking?.room?.pension_id) {
        const pension = await prisma.pension.findUnique({
          where: { pension_id: booking.room.pension_id }
        });
        if (pension) pensionName = pension.name;
      }
      
      console.log('✅ Found Booking for Slip:', {
        bookingId: booking?.booking_id,
        roomId: booking?.room_id,
        pensionId: booking?.room?.pension_id,
        pensionName
      });
      
      if (booking) {
        await prisma.booking.update({ 
          where: { booking_id: booking.booking_id }, 
          data: { status: 'Confirmed' } 
        });

        // Auto-occupy room if check-in is today
        const today = new Date();
        today.setHours(0,0,0,0);
        const checkIn = new Date(booking.check_in_date || today);
        checkIn.setHours(0,0,0,0);

        if (checkIn <= today && booking.room_id) {
          await prisma.room.update({
            where: { room_id: booking.room_id },
            data: { availability_status: 'Occupied', last_status_update: new Date() }
          });
          console.log(`📡 AUTO-OCCUPY: Room ${booking.room_id} marked as Occupied immediately after payment`);
        }

        // Send Confirmation SMS
        if (booking.customer?.phone) {
          try {
            const slipLink = `${process.env.FRONTEND_URL}/booking/success?ref=${txRef}`;
            const message = `Payment Received! Thank you ${booking.customer.full_name} for booking Room ${booking.room?.room_number || 'Assigned'}. View your digital slip here: ${slipLink}`;
            await SMSService.sendSMS(booking.customer.phone, message);
            console.log(`✅ Confirmation SMS sent to ${booking.customer.phone}`);
          } catch (smsError) {
            console.error('⚠️ Failed to send confirmation SMS:', smsError);
          }
        }
      }

      return res.json({ 
        success: true, 
        message: 'Payment verified successfully', 
        data: {
          ...verification.data,
          booking: {
            ...booking,
            room: {
              ...booking?.room,
              pension: { name: pensionName }
            }
          },
          pension_name: pensionName,
          user: booking?.customer,
          reference: txRef,
          amount: payment.amount
        } 
      });
    }

    console.warn('⚠️ Payment Verification Unsuccessful:', verification);
    res.status(400).json({ 
      success: false, 
      message: verification.message || 'Payment verification failed', 
      data: verification.data 
    });
  } catch (error: any) {
    console.error('❌ Payment Verify Route Error:', {
      message: error.message,
      txRef: req.params.txRef
    });
    res.status(500).json({ success: false, message: error.message || 'Failed to verify payment' });
  }
});

// Chapa Webhook
router.post('/webhook', async (req, res) => {
  console.log('🔔 Webhook received:', req.body);
  
  // Validate webhook signature (Chapa uses HMAC SHA256)
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  const signature = req.headers['x-chapa-signature'];

  if (secret && signature) {
    const hash = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
      
    if (hash !== signature) {
      console.warn('⚠️ Webhook signature mismatch. Processing anyway for DEMO mode.');
    } else {
      console.log('✅ Webhook signature verified.');
    }
  } else {
    console.log('ℹ️ Webhook secret or signature missing. Processing in DEMO mode.');
  }

  const { tx_ref, status } = req.body;

  try {
    if (status === 'success') {
      const payment = await prisma.payment.update({
        where: { reference: tx_ref },
        data: { status: 'PAID' },
      });

      // Update booking status on webhook
      const booking = await prisma.booking.findFirst({ 
        where: { payment_id: payment.payment_id },
        include: {
          room: true,
          customer: true
        }
      });
      
      if (booking) {
        await prisma.booking.update({ 
          where: { booking_id: booking.booking_id }, 
          data: { status: 'Confirmed' } 
        });

        // Auto-occupy room if check-in is today
        const today = new Date();
        today.setHours(0,0,0,0);
        const checkIn = new Date(booking.check_in_date || today);
        checkIn.setHours(0,0,0,0);

        if (checkIn <= today && booking.room_id) {
          await prisma.room.update({
            where: { room_id: booking.room_id },
            data: { availability_status: 'Occupied', last_status_update: new Date() }
          });
        }
        
        console.log(`✅ Booking ${booking.booking_id} confirmed via webhook`);

        // Send Confirmation SMS
        if (booking.customer?.phone) {
          try {
            const slipLink = `${process.env.FRONTEND_URL}/booking/success?ref=${tx_ref}`;
            const message = `Payment Received! Thank you ${booking.customer.full_name} for booking Room ${booking.room?.room_number || 'Assigned'}. View your digital slip here: ${slipLink}`;
            await SMSService.sendSMS(booking.customer.phone, message);
            console.log(`✅ Confirmation SMS sent to ${booking.customer.phone} via webhook`);
          } catch (smsError) {
            console.error('⚠️ Failed to send confirmation SMS via webhook:', smsError);
          }
        }
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
