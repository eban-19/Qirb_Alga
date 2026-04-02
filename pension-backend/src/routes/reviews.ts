import * as express from 'express';
import { executeQuery } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get reviews for a specific pension (public)
router.get('/pension/:pensionId', async (req: any, res: any) => {
  try {
    const { pensionId } = req.params;
    const { page = 1, limit = 10, rating, approved_only = true } = req.query;
    const offset = String((parseInt(page as string) - 1) * parseInt(limit as string));

    let query = `
      SELECT r.*, u.full_name, u.email
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      WHERE r.pension_id = ?
    `;
    
    const params: any[] = [pensionId];

    if (approved_only === 'true') {
      query += ' AND r.is_approved = TRUE';
    }

    if (rating) {
      query += ' AND r.rating = ?';
      params.push(rating as string);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), offset);

    const reviews = await executeQuery(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE r.pension_id = ?
    `;
    
    const countParams = [pensionId];

    if (approved_only === 'true') {
      countQuery += ' AND r.is_approved = TRUE';
    }

    if (rating) {
      countQuery += ' AND r.rating = ?';
      countParams.push(rating as string);
    }

    const countResult = await executeQuery(countQuery, countParams);

    res.json({
      success: true,
      reviews
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
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const reviews = await executeQuery(`
      SELECT r.*, p.name as pension_name, p.address as pension_address
      FROM reviews r
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit as string), offset]);

    // Get total count
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM reviews WHERE customer_id = ?',
      [userId]
    );

    res.json({
      success: true,
      reviews
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
    const existingReview = await executeQuery(
      'SELECT * FROM reviews WHERE customer_id = ? AND pension_id = ?',
      [userId, pension_id]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this pension'
      });
    }

    // Check if user has a confirmed booking for this pension
    const bookingCheck = await executeQuery(`
      SELECT b.* FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.room_id
      WHERE b.customer_id = ? AND r.pension_id = ? AND b.status = 'Completed'
    `, [userId, pension_id]);

    if (bookingCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review pensions you have stayed at'
      });
    }

    // Create review
    const result = await executeQuery(`
      INSERT INTO reviews (customer_id, pension_id, rating, comment, is_approved, created_at)
      VALUES (?, ?, ?, ?, FALSE, NOW())
    `, [userId, pension_id, rating, comment]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      data: {
        reviewId: result.insertId,
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
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const reviews = await executeQuery(`
      SELECT r.*, u.full_name as reviewer_name, u.email as reviewer_email,
             p.name as pension_name, p.address as pension_address
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.is_approved = FALSE
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit as string), offset]);

    // Get total count
    const countResult = await executeQuery(
      'SELECT COUNT(*) as total FROM reviews WHERE is_approved = FALSE'
    );

    res.json({
      success: true,
      reviews
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

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'approved field must be boolean'
      });
    }

    if (approved) {
      await executeQuery(
        'UPDATE reviews SET is_approved = TRUE, rejection_reason = NULL WHERE review_id = ?',
        [reviewId]
      );
    } else {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a review'
        });
      }

      await executeQuery(
        'UPDATE reviews SET is_approved = FALSE, rejection_reason = ? WHERE review_id = ?',
        [rejectionReason, reviewId]
      );
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

    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE pension_id = ? AND is_approved = TRUE
    `, [pensionId]);

    const result = stats[0];

    res.json({
      success: true,
      data: {
        totalReviews: result.total_reviews || 0,
        averageRating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : 0,
        ratingDistribution: {
          5: result.five_star || 0,
          4: result.four_star || 0,
          3: result.three_star || 0,
          2: result.two_star || 0,
          1: result.one_star || 0
        }
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
