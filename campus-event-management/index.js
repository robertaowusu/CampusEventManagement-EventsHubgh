const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const auth = require('./middleware/auth');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/events', auth, eventRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Campus Event Management System is running!');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server first
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  
  // Connect to MongoDB after server starts
  connectDB()
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
});

// Error handlers
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
  });
}); 