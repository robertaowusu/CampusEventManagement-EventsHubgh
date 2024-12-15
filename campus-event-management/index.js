const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const auth = require('./middleware/auth');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', auth, eventRoutes);

// Basic route with more information
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Event Management System API is running',
    version: '1.0.0',
    endpoints: {
      auth: [
        { path: '/api/auth/register', method: 'POST' },
        { path: '/api/auth/login', method: 'POST' }
      ],
      events: [
        { path: '/api/events', method: 'GET' },
        { path: '/api/events', method: 'POST' },
        { path: '/api/events/:id', method: 'GET' },
        { path: '/api/events/:id', method: 'PUT' },
        { path: '/api/events/:id', method: 'DELETE' }
      ]
    }
  });
});

// Serve React app for any other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    } else {
      res.send(`
        <html>
          <head>
            <title>Campus Event Management System</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { color: #333; }
              .status { color: green; }
              .endpoints { margin-top: 20px; }
              .endpoint { margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>Campus Event Management System</h1>
            <p class="status">✅ Server is running!</p>
            <div class="endpoints">
              <h2>Available Endpoints:</h2>
              <div class="endpoint">🔐 Authentication: /api/auth/login, /api/auth/register</div>
              <div class="endpoint">📅 Events: /api/events</div>
            </div>
            <p>For API documentation, visit /api/status</p>
          </body>
        </html>
      `);
    }
  });
}

// Add error handling middleware back
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
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