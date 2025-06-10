require('dotenv').config();
const path = require('path');

console.log('Environment Variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { authenticateToken, checkAccess } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}



app.get('/', (req, res) => {
  res.send('Welcome to the Multi-School Portal API!');
});

const authRouter = require('./routes/auth');
const accessCardsRouter = require('./routes/access-cards');

app.use('/api/auth', authRouter);
app.use('/api/access-cards', authenticateToken, accessCardsRouter);

app.get('/api/start', authenticateToken, checkAccess, (req, res) => {
  res.json({ message: 'Access granted to start page' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found' });
    } else {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    }
  });
}


async function startServer() {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();       