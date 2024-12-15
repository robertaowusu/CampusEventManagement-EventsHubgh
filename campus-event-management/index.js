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
app.use('/api/events', auth, eventRoutes);

// API Status route
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

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Campus Event Management System</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          h1 { 
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
          }
          .status { 
            color: #27ae60;
            font-weight: bold;
          }
          .endpoints { 
            margin-top: 20px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
          }
          .endpoint { 
            margin: 10px 0;
            padding: 5px 0;
          }
          .api-doc {
            margin-top: 20px;
            color: #2980b9;
          }
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
        <p class="api-doc">For API documentation, visit <a href="/api/status">/api/status</a></p>
      </body>
    </html>
  `);
});

// Error handling middleware
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