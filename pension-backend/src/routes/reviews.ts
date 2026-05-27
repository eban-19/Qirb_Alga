import * as express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { BookingStatus, Prisma } from '@prisma/client';

const router = express.Router();

// Helper to check if user has admin privileges
const isAdmin = (req: any) => req.user && req.user.role === 'Admin';

// ==========================================
// 1. PUBLIC ENDPOINTS
// ==========================================

// Get reviews for a specific pension
router.get('/pension/:pensionId', async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;
    const { page = 1, limit = 10, rating, has_images, sort_by = 'newest' } = req.query;
    const pId = parseInt(pensionId as string);

    if (isNaN(pId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    // All reviews are visible publicly — no approval filter
    const where: any = {
      pension_id: pId
    };

    if (rating) {
      const ratingVal = parseInt(rating as string);
      if (!isNaN(ratingVal)) {
        where.rating = ratingVal;
      }
    }

    // Dynamic sorting
    let orderBy: any = { created_at: 'desc' };
    if (sort_by === 'highest_rating') {
      orderBy = { rating: 'desc' };
    } else if (sort_by === 'lowest_rating') {
      orderBy = { rating: 'asc' };
    } else if (sort_by === 'oldest') {
      orderBy = { created_at: 'asc' };
    }

    let reviews = await prisma.review.findMany({
      where,
      include: {
        customer: {
          select: {
            full_name: true,
            email: true
          }
        }
      },
      orderBy
    });

    // Post-query filter for has_images (Json field null comparison is unreliable in Prisma)
    if (has_images === 'true') {
      reviews = reviews.filter(r => {
        if (!r.images) return false;
        try {
          const imgs = typeof r.images === 'string' ? JSON.parse(r.images as string) : (r.images as any[]);
          return Array.isArray(imgs) && imgs.length > 0;
        } catch { return false; }
      });
    }

    const total = reviews.length;
    const paginated = reviews.slice(skip, skip + take);

    // Format reviews for client compatibility
    const formattedReviews = paginated.map(r => ({
      ...r,
      full_name: r.customer?.full_name || 'Anonymous Guest',
      email: r.customer?.email ? r.customer.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : ''
    }));

    res.json({
      success: true,
      data: {
        items: formattedReviews,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });

  } catch (error: any) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Get review statistics for a pension
router.get('/pension/:pensionId/stats', async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;
    const pId = parseInt(pensionId as string);

    if (isNaN(pId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    const aggregate = await prisma.review.aggregate({
      where: { pension_id: pId },
      _count: { _all: true },
      _avg: { rating: true }
    });

    const groupBy = await prisma.review.groupBy({
      by: ['rating'],
      where: { pension_id: pId },
      _count: { _all: true }
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    groupBy.forEach(item => {
      const r = item.rating;
      const count = item._count._all || 0;
      distribution[r] = count;
    });

    res.json({
      success: true,
      data: {
        totalReviews: aggregate._count._all || 0,
        averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(1)) : 0,
        ratingDistribution: distribution
      }
    });

  } catch (error: any) {
    console.error('Get review stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get review statistics' });
  }
});

// ==========================================
// 2. AUTHENTICATED CUSTOMER ENDPOINTS
// ==========================================

// Get reviews for current logged-in user
router.get('/my/reviews', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
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
      }),
      prisma.review.count({ where: { customer_id: userId } })
    ]);

    const formattedReviews = reviews.map(r => ({
      ...r,
      pension_name: r.pension?.name || 'Pension',
      pension_address: r.pension?.address || ''
    }));

    res.json({
      success: true,
      data: {
        items: formattedReviews,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });

  } catch (error: any) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user reviews' });
  }
});

// Create new review (Verified stays only!)
router.post('/', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { pension_id, booking_id, rating, comment, images } = req.body;
    const pId = parseInt(pension_id as string);
    const bId = booking_id ? parseInt(booking_id as string) : undefined;

    // Validate input
    if (isNaN(pId) || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Pension ID and rating are required'
      });
    }

    const ratingVal = parseInt(rating as string);
    if (ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    let bookingCheck = null;

    if (bId) {
      bookingCheck = await prisma.booking.findFirst({
        where: {
          booking_id: bId,
          customer_id: userId,
          status: BookingStatus.Completed,
          room: {
            pension_id: pId
          }
        },
        include: {
          review: true
        }
      });
    } else {
      // Find a Completed booking at this pension that doesn't have a review yet
      bookingCheck = await prisma.booking.findFirst({
        where: {
          customer_id: userId,
          status: BookingStatus.Completed,
          room: {
            pension_id: pId
          },
          review: null // Ensures this booking hasn't been reviewed
        },
        include: {
          review: true
        }
      });

      // If no unreviewed completed bookings, check if there is any reviewed completed booking to update
      if (!bookingCheck) {
        const reviewedBooking = await prisma.booking.findFirst({
          where: {
            customer_id: userId,
            status: BookingStatus.Completed,
            room: {
              pension_id: pId
            }
          },
          include: {
            review: true
          },
          orderBy: {
            check_out_date: 'desc'
          }
        });

        if (reviewedBooking && reviewedBooking.review) {
          bookingCheck = reviewedBooking;
        }
      }
    }

    if (!bookingCheck) {
      return res.status(400).json({
        success: false,
        message: 'You can only review pensions where you have a completed stay.'
      });
    }

    // If the booking already has a review, update it instead of creating a new one
    if (bookingCheck.review) {
      const review = await prisma.review.update({
        where: { review_id: bookingCheck.review.review_id },
        data: {
          rating: ratingVal,
          comment: comment || null,
          images: (images ? JSON.stringify(images) : null) as any,
          is_approved: true,
          rejection_reason: null
        }
      });

      return res.json({
        success: true,
        message: 'Review updated successfully.',
        data: review
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        customer_id: userId,
        pension_id: pId,
        booking_id: bookingCheck.booking_id,
        rating: ratingVal,
        comment: comment || null,
        images: (images ? JSON.stringify(images) : null) as any,
        is_approved: true // Auto-published, no moderation
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: review
    });

  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review'
    });
  }
});

// Update review (customer edits their review)
router.put('/:reviewId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const rId = parseInt(reviewId as string);

    if (isNaN(rId)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await prisma.review.findUnique({
      where: { review_id: rId }
    });

    if (!review || review.customer_id !== userId) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }

    const ratingVal = parseInt(rating as string);
    if (rating && (ratingVal < 1 || ratingVal > 5)) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await prisma.review.update({
      where: { review_id: rId },
      data: {
        ...(rating && { rating: ratingVal }),
        comment: comment !== undefined ? comment : review.comment,
        images: (images !== undefined ? (images ? JSON.stringify(images) : null) : review.images) as any,
        is_approved: true, // Keep published after edits
        rejection_reason: null
      }
    });

    res.json({
      success: true,
      message: 'Review updated successfully.',
      data: updatedReview
    });

  } catch (error: any) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
});

// Delete review (Customer deletes their review, or Admin deletes it)
router.delete('/:reviewId', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const rId = parseInt(reviewId as string);

    if (isNaN(rId)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await prisma.review.findUnique({
      where: { review_id: rId }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership or admin status
    if (review.customer_id !== userId && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this review' });
    }

    await prisma.review.delete({
      where: { review_id: rId }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});

// Report a review as abusive or spam
router.post('/:reviewId/report', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { reason } = req.body;
    const rId = parseInt(reviewId as string);

    if (isNaN(rId) || !reason) {
      return res.status(400).json({ success: false, message: 'Review ID and report reason are required' });
    }

    // Verify review exists
    const review = await prisma.review.findUnique({
      where: { review_id: rId }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if already reported by this user
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        review_id: rId,
        user_id: userId
      }
    });

    if (existingReport) {
      return res.status(400).json({ success: false, message: 'You have already reported this review' });
    }

    const report = await prisma.reviewReport.create({
      data: {
        review_id: rId,
        user_id: userId,
        reason,
        status: 'Pending'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review reported successfully. Administrators will moderate it.',
      data: report
    });

  } catch (error: any) {
    console.error('Report review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
});

// ==========================================
// 3. OWNER ENDPOINTS (REPLY & ANALYTICS)
// ==========================================

// Post owner response/reply
router.post('/:reviewId/reply', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { reply } = req.body;
    const rId = parseInt(reviewId as string);

    if (isNaN(rId)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }

    // Fetch review and ensure user is owner of the pension
    const review = await prisma.review.findUnique({
      where: { review_id: rId },
      include: {
        pension: {
          select: {
            owner_id: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.pension?.owner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You must be the owner of this pension.' });
    }

    const updatedReview = await prisma.review.update({
      where: { review_id: rId },
      data: {
        owner_reply: reply || null,
        owner_reply_at: reply ? new Date() : null
      }
    });

    res.json({
      success: true,
      message: reply ? 'Reply posted successfully' : 'Reply removed successfully',
      data: updatedReview
    });

  } catch (error: any) {
    console.error('Owner reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to post owner reply' });
  }
});

// Get review analytics for pension owner
router.get('/pension/:pensionId/analytics', authenticateToken as any, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { pensionId } = req.params;
    const pId = parseInt(pensionId as string);

    if (isNaN(pId)) {
      return res.status(400).json({ success: false, message: 'Invalid pension ID' });
    }

    // Allow access for: pension owner or admin
    const userRole = req.user.role?.toLowerCase();
    let hasAccess = false;

    if (userRole === 'admin') {
      const pensionExists = await prisma.pension.findFirst({ where: { pension_id: pId } });
      hasAccess = !!pensionExists;
    } else {
      const ownedPension = await prisma.pension.findFirst({
        where: { pension_id: pId, owner_id: userId }
      });
      hasAccess = !!ownedPension;
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch rating trends by month (past 6 months)
    const reviews = await prisma.review.findMany({
      where: {
        pension_id: pId
      },
      select: {
        rating: true,
        created_at: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Group by month
    const monthlyData: Record<string, { totalRating: number; count: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    reviews.forEach(r => {
      if (!r.created_at) return;
      const date = new Date(r.created_at);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { totalRating: 0, count: 0 };
      }
      monthlyData[monthYear].totalRating += r.rating;
      monthlyData[monthYear].count += 1;
    });

    const trend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      averageRating: parseFloat((data.totalRating / data.count).toFixed(2)),
      reviewsCount: data.count
    }));

    // Calculate customer satisfaction score (percentage of 4 & 5 stars reviews)
    const totalCount = reviews.length;
    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const csat = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        trend,
        csat,
        totalReviews: totalCount
      }
    });

  } catch (error: any) {
    console.error('Get reviews analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to load review analytics' });
  }
});

// ==========================================
// 4. ADMIN MODERATION ENDPOINTS
// ==========================================

// Admin: Get all reviews (pending moderation)
router.get('/admin/pending', authenticateToken as any, async (req: any, res: any) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { page = 1, limit = 10 } = req.query;
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: { is_approved: false, rejection_reason: null },
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
      }),
      prisma.review.count({ where: { is_approved: false, rejection_reason: null } })
    ]);

    const formattedReviews = reviews.map(r => ({
      ...r,
      reviewer_name: r.customer?.full_name || 'Anonymous Guest',
      reviewer_email: r.customer?.email || '',
      pension_name: r.pension?.name || '',
      pension_address: r.pension?.address || ''
    }));

    res.json({
      success: true,
      data: {
        items: formattedReviews,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });

  } catch (error: any) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending reviews' });
  }
});

// Admin: Get reported reviews
router.get('/admin/reports', authenticateToken as any, async (req: any, res: any) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { page = 1, limit = 10 } = req.query;
    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const [reports, total] = await prisma.$transaction([
      prisma.reviewReport.findMany({
        include: {
          user: {
            select: {
              full_name: true,
              email: true
            }
          },
          review: {
            include: {
              customer: {
                select: {
                  full_name: true
                }
              },
              pension: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take
      }),
      prisma.reviewReport.count()
    ]);

    res.json({
      success: true,
      data: {
        items: reports,
        pagination: {
          page: parseInt(page as string),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    });

  } catch (error: any) {
    console.error('Get reported reviews error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reported reviews' });
  }
});

// Admin: Approve/reject review
router.put('/admin/:reviewId/approval', authenticateToken as any, async (req: any, res: any) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { reviewId } = req.params;
    const { approved, rejectionReason } = req.body;
    const rId = parseInt(reviewId as string);

    if (isNaN(rId) || typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid arguments'
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

// Admin: Resolve/Dismiss review report
router.put('/admin/reports/:reportId', authenticateToken as any, async (req: any, res: any) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
    }

    const { reportId } = req.params;
    const { status, hideReview } = req.body; // status: "Resolved" | "Dismissed", hideReview: boolean
    const repId = parseInt(reportId as string);

    if (isNaN(repId) || !['Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid arguments' });
    }

    const report = await prisma.reviewReport.findUnique({
      where: { report_id: repId }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    await prisma.$transaction(async (tx) => {
      // Update report status
      await tx.reviewReport.update({
        where: { report_id: repId },
        data: { status }
      });

      // If resolved and hideReview is selected, hide the review by settings approved to false and updating reason
      if (status === 'Resolved' && hideReview) {
        await tx.review.update({
          where: { review_id: report.review_id },
          data: {
            is_approved: false,
            rejection_reason: 'Hidden by Admin due to reports'
          }
        });
      }
    });

    res.json({
      success: true,
      message: `Report status updated to ${status}`
    });

  } catch (error: any) {
    console.error('Resolve report error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
});

export default router;
