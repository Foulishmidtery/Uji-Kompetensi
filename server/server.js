const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/borrowings', require('./routes/borrowingRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'InvenTrack API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
