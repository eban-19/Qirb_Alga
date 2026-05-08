import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { BookingStatus } from '@prisma/client';

const router = express.Router();

// Get reviews for a specific pension (public)
router.get('/pension/:pensionId', async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;
    const { page = 1, limit = 10, rating, approved_only = true } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    const pId = parseInt(pensionId as string);

    const where: any = {
      pension_id: pId
    };

    if (approved_only === 'true' || approved_only === true) {
      where.is_approved = true;
    }

    if (rating) {
      where.rating = parseInt(rating as string);
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take
    });

    // Formatting to match previous SQL result structure
    const formattedReviews = reviews.map(r => ({
      ...r,
      full_name: r.customer?.full_name,
      email: r.customer?.email
    }));

    res.json({
      success: true,
      reviews: formattedReviews
    });

  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Get reviews for current user (my reviews)
router.get('/my/reviews', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const reviews = await prisma.review.findMany({
      where: { customer_id: userId },
      include: {
        pension: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take
    });

    const formattedReviews = reviews.map(r => ({
      ...r,
      pension_name: r.pension?.name,
      pension_address: r.pension?.address
    }));

    res.json({
      success: true,
      reviews: formattedReviews
    });

  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user reviews' });
  }
});

// Create new review
router.post('/', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { pension_id, rating, comment } = req.body;
    const pId = parseInt(pension_id as string);

    // Validate input
    if (!pension_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Pension ID, rating, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if user has already reviewed this pension
    const existingReview = await prisma.review.findFirst({
      where: {
        customer_id: userId,
        pension_id: pId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this pension'
      });
    }

    // Check if user has a completed booking for this pension
    const bookingCheck = await prisma.booking.findFirst({
      where: {
        customer_id: userId,
        status: BookingStatus.Completed,
        room: {
          pension_id: pId
        }
      }
    });

    if (!bookingCheck) {
      return res.status(400).json({
        success: false,
        message: 'You can only review pensions you have stayed at'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        customer_id: userId,
        pension_id: pId,
        booking_id: bookingCheck.booking_id,
        rating: parseInt(rating as string),
        comment,
        is_approved: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: {
        reviewId: review.review_id,
        rating,
        comment,
        status: 'Pending'
      }
    });

  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
});

// Admin: Get all reviews (pending approval)
router.get('/admin/pending', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const reviews = await prisma.review.findMany({
      where: { is_approved: false },
      include: {
        customer: {
          select: {
            full_name: true,
            email: true
          }
        },
        pension: {
          select: {
            name: true,
            address: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take
    });

    const formattedReviews = reviews.map(r => ({
      ...r,
      reviewer_name: r.customer?.full_name,
      reviewer_email: r.customer?.email,
      pension_name: r.pension?.name,
      pension_address: r.pension?.address
    }));

    res.json({
      success: true,
      reviews: formattedReviews
    });

  } catch (error: any) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending reviews' });
  }
});

// Admin: Approve/reject review
router.put('/admin/:reviewId/approval', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { reviewId } = req.params;
    const { approved, rejectionReason } = req.body;
    const rId = parseInt(reviewId as string);

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'approved field must be boolean'
      });
    }

    if (approved) {
      await prisma.review.update({
        where: { review_id: rId },
        data: {
          is_approved: true,
          rejection_reason: null
        }
      });
    } else {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a review'
        });
      }

      await prisma.review.update({
        where: { review_id: rId },
        data: {
          is_approved: false,
          rejection_reason: rejectionReason
        }
      });
    }

    res.json({
      success: true,
      message: approved ? 'Review approved successfully' : 'Review rejected successfully'
    });

  } catch (error: any) {
    console.error('Review approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status'
    });
  }
});

// Get review statistics for a pension
router.get('/pension/:pensionId/stats', async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;
    const pId = parseInt(pensionId as string);

    const aggregate = await prisma.review.aggregate({
      where: {
        pension_id: pId,
        is_approved: true
      },
      _count: {
        _all: true
      },
      _avg: {
        rating: true
      }
    });

    const groupBy = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        pension_id: pId,
        is_approved: true
      },
      _count: {
        _all: true
      }
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    groupBy.forEach(item => {
      const rating = item.rating;
      const count = (item._count as any)?._all || 0;
      distribution[rating] = count;
    });

    res.json({
      success: true,
      data: {
        totalReviews: (aggregate._count as any)?._all || 0,
        averageRating: aggregate._avg?.rating ? aggregate._avg.rating.toFixed(1) : "0",
        ratingDistribution: distribution
      }
    });

  } catch (error: any) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get review statistics'
    });
  }
});

export default router;
