const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get all access cards for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT 
        ac.accesscard_id,
        ac.email,
        ac.role,
        ac.global,
        s.school_name,
        s.logo_url,
        CASE 
          WHEN ac.role = 'Student' THEN (
            SELECT COUNT(*) > 0 
            FROM enrollments e 
            WHERE e.accesscard_id = ac.accesscard_id
          )
          ELSE true
        END as has_valid_enrollment
      FROM accesscards ac
      LEFT JOIN schools s ON ac.school_id = s.school_id
      WHERE ac.account_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Check for students without enrollments
    const invalidCards = result.rows.filter(card => 
      card.role === 'Student' && !card.has_valid_enrollment
    );
    
    if (invalidCards.length > 0) {
      return res.status(400).json({ 
        error: 'Some student access cards have no enrollments',
        invalidCards: invalidCards.map(card => ({
          email: card.email,
          school: card.school_name
        }))
      });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching access cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 