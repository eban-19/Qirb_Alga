const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a specific pension (public)
router.get('/pension/:pensionId', async (req, res) => {
  try {
    const { pensionId } = req.params;
    const { page = 1, limit = 10, rating, approved_only = true } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.full_name, u.email
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      WHERE r.pension_id = ?
    `;
    
    const params = [pensionId];

    if (approved_only === 'true') {
      query += ' AND r.is_approved = TRUE';
    }

    if (rating) {
      query += ' AND r.rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const reviewsResult = await executeQuery(query, params);
    
    const reviews = reviewsResult.map(r => ({
      ...r,
      id: r.review_id,
      user_id: r.customer_id
    }));

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM reviews r WHERE r.pension_id = ?';
    const countParams = [pensionId];

    if (approved_only === 'true') {
      countQuery += ' AND r.is_approved = TRUE';
    }

    if (rating) {
      countQuery += ' AND r.rating = ?';
      countParams.push(rating);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0].total;

    // Get rating statistics
    const ratingStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews 
      WHERE pension_id = ? AND is_approved = TRUE
    `, [pensionId]);

    res.json({
      success: true,
      data: {
        reviews: reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: ratingStats[0]
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get review by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const review = await executeQuery(`
      SELECT r.*, u.full_name, u.email,
             p.name as pension_name, p.address as pension_address
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.review_id = ?
    `, [id]);

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: {
        review: { ...review[0], id: review[0].review_id, user_id: review[0].customer_id }
      }
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Create new review (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      pension_id,
      rating,
      comment
    } = req.body;

    // Validate required fields
    if (!pension_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Pension ID and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if pension exists
    const pension = await executeQuery(
      'SELECT * FROM pensions WHERE pension_id = ?',
      [pension_id]
    );

    if (pension.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pension not found'
      });
    }

    // Check if user has already reviewed this pension
    const existingReview = await executeQuery(
      'SELECT * FROM reviews WHERE pension_id = ? AND customer_id = ?',
      [pension_id, userId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this pension'
      });
    }

    // Create review
    const result = await executeQuery(
      `INSERT INTO reviews (customer_id, pension_id, rating, comment, is_approved, created_at)
       VALUES (?, ?, ?, ?, FALSE, NOW())`,
      [userId, pension_id, rating, comment]
    );

    // Get created review
    const newReview = await executeQuery(`
      SELECT r.*, u.full_name, u.email,
             p.name as pension_name
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.review_id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Review created successfully. It will be visible after approval.',
      data: {
        review: { ...newReview[0], id: newReview[0].review_id, user_id: newReview[0].customer_id }
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update review (protected)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;
    const {
      rating,
      comment,
      is_approved
    } = req.body;

    // Get review
    const review = await executeQuery(`
      SELECT r.*, p.owner_id as pension_owner_id
      FROM reviews r
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.review_id = ?
    `, [id]);

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const reviewData = review[0];

    // Check permissions
    const canUpdate = reviewData.customer_id === userId || 
                     userRole === 'admin' || 
                     reviewData.pension_owner_id === userId;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Only admin or pension owner can approve reviews
    if (is_approved !== undefined && userRole !== 'admin' && reviewData.pension_owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or pension owner can approve reviews'
      });
    }

    // Update review
    await executeQuery(
      `UPDATE reviews 
       SET rating = ?, comment = ?, is_approved = ?, updated_at = NOW()
       WHERE review_id = ?`,
      [rating || reviewData.rating, 
       comment || reviewData.comment, 
       is_approved !== undefined ? is_approved : reviewData.is_approved, 
       id]
    );

    // Get updated review
    const updatedReview = await executeQuery(`
      SELECT r.*, u.full_name, u.email,
             p.name as pension_name
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.review_id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: { ...updatedReview[0], id: updatedReview[0].review_id, user_id: updatedReview[0].customer_id }
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete review (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    // Get review
    const review = await executeQuery(`
      SELECT r.*, p.owner_id as pension_owner_id
      FROM reviews r
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE r.review_id = ?
    `, [id]);

    if (review.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const reviewData = review[0];

    // Check permissions
    const canDelete = reviewData.customer_id === userId || 
                     userRole === 'admin' || 
                     reviewData.pension_owner_id === userId;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete review
    await executeQuery('DELETE FROM reviews WHERE review_id = ?', [id]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get user's reviews (protected)
router.get('/my/reviews', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, pension_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, p.name as pension_name
      FROM reviews r
      LEFT JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    
    const params = [userId];

    if (pension_id) {
      query += ' AND r.pension_id = ?';
      params.push(pension_id);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const reviewsResult = await executeQuery(query, params);
    
    // Normalize Review ID if it's named review_id
    const normalizedReviews = reviewsResult.map(r => ({
      ...r,
      id: r.review_id,
      user_id: r.customer_id
    }));

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      JOIN pensions p ON r.pension_id = p.pension_id
      WHERE p.owner_id = ?
    `;
    const countParams = [userId];

    if (pension_id) {
      countQuery += ' AND r.pension_id = ?';
      countParams.push(pension_id);
    }

    const countResult = await executeQuery(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        items: normalizedReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    next(error);
  }
});

module.exports = router;
