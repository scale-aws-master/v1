const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const checkAccess = async (req, res, next) => {
  try {
    const { type, resource } = req.params;
    const userId = req.user.id;

    // Get the user's access cards
    const accessCardsQuery = `
      SELECT ac.*, s.school_name 
      FROM accesscards ac
      LEFT JOIN schools s ON ac.school_id = s.school_id
      WHERE ac.account_id = $1
    `;
    const accessCardsResult = await pool.query(accessCardsQuery, [userId]);
    const accessCards = accessCardsResult.rows;

    // Get the permission for the requested resource
    const permissionQuery = `
      SELECT * FROM permissions 
      WHERE type = $1 AND resource = $2
    `;
    const permissionResult = await pool.query(permissionQuery, [type, resource]);
    const permission = permissionResult.rows[0];

    if (!permission) {
      return res.status(403).json({ error: 'No permission found for this resource' });
    }

    // Check if any of the user's access cards satisfy the permission rules
    const rules = permission.rules.rules;
    const hasAccess = accessCards.some(card => {
      return rules.some(rule => {
        if (rule.condition === 'roles') {
          return rule.roles.includes(card.role);
        }
        return false;
      });
    });

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateToken, checkAccess }; 