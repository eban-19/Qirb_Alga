const express = require('express');
const { executeQuery } = require('../config/database');

const router = express.Router();

// Get room types for a pension
router.get('/pension/:pensionId/room-types', async (req, res) => {
  try {
    const { pensionId } = req.params;
    
    const roomTypes = await executeQuery(
      'SELECT DISTINCT room_type FROM rooms WHERE pension_id = ? ORDER BY room_type',
      [pensionId]
    );
    
    res.json({
      success: true,
      data: roomTypes.map(type => type.room_type)
    });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ success: false, message: 'Error fetching room types' });
  }
});

module.exports = router;
