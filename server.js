require('dotenv').config();

// Debug logging
console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { authenticateToken, checkAccess } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Multi-School Portal API!');
});

// Routes
const authRouter = require('./routes/auth');
const accessCardsRouter = require('./routes/access-cards');

app.use('/api/auth', authRouter);
app.use('/api/access-cards', authenticateToken, accessCardsRouter);

// Protected routes with role-based access
app.get('/api/start', authenticateToken, checkAccess, (req, res) => {
  res.json({ message: 'Access granted to start page' });
});

// Database connection test and server start
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer(); 