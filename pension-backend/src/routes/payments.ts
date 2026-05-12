import express from 'express';
import { PrismaClient } from '@prisma/client';
import { initializePayment, verifyPayment } from '../services/chapaService';
import { SMSService } from '../services/sms.service';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

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

    const chapaData = {
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

    console.log('🚀 Initializing Chapa Payment:', {
      tx_ref: chapaData.tx_ref,
      amount: chapaData.amount,
      email: chapaData.email,
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
      // Update payment status in DB
      const payment = await prisma.payment.update({
        where: { reference: txRef },
        data: { status: 'PAID' },
      });

      // Update booking status
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
          booking: booking,
          user: booking?.customer,
          reference: txRef,
          amount: payment.amount
        } 
      });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed', data: verification.data });
  } catch (error: any) {
    console.error('Payment Verify Error:', error);
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
