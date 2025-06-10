const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // First try to find the account by primary email
    let account = await pool.query(
      'SELECT * FROM Accounts WHERE primary_email = $1',
      [email]
    );

    // If not found, try to find by access card email
    if (account.rows.length === 0) {
      const accessCard = await pool.query(
        'SELECT a.* FROM AccessCards ac JOIN Accounts a ON ac.account_id = a.account_id WHERE ac.email = $1',
        [email]
      );
      if (accessCard.rows.length > 0) {
        account = accessCard;
      }
    }

    if (account.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, account.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get all access cards for this account
    const accessCards = await pool.query(
      `SELECT ac.*, s.school_name 
       FROM AccessCards ac 
       LEFT JOIN Schools s ON ac.school_id = s.school_id 
       WHERE ac.account_id = $1`,
      [account.rows[0].account_id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: account.rows[0].account_id,
        email: account.rows[0].primary_email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        account_id: account.rows[0].account_id,
        name: account.rows[0].name,
        accessCards: accessCards.rows
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get access cards for authenticated user
router.get('/access-cards', async (req, res) => {
  try {
    const { account_id } = req.query;
    if (!account_id) {
      return res.status(401).json({ message: 'No account ID provided' });
    }
    
    const accessCards = await pool.query(
      `SELECT ac.*, s.school_name 
       FROM AccessCards ac 
       LEFT JOIN Schools s ON ac.school_id = s.school_id 
       WHERE ac.account_id = $1`,
      [account_id]
    );

    res.json(accessCards.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 