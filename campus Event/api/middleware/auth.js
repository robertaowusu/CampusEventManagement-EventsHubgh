const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: 'No Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find user in database
    const user = await User.findById(decoded.userId);
    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Set user info in request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    };

    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}; 