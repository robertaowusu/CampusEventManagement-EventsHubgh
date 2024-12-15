const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create event route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Admin check middleware
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Event creation with required fields
    const eventData = {
      title: { type: String, required: true },
      date: { type: Date, required: true },
      time: { type: String, required: true },
      location: { type: String, required: true },
      description: { type: String, required: true },
      category: { type: String, required: true },
      capacity: { type: Number, required: true }
    };

    const newEvent = new Event(eventData);
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
});

// Get all events route
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// First, specific routes
router.get('/manage', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/user/registered', auth, async (req, res) => {
  try {
    console.log('Fetching registered events for user:', req.user.id);
    const events = await Event.find({
      'registeredUsers.userId': req.user.id
    }).sort({ date: 1 });

    console.log('Found events:', events.length);
    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Error fetching user events' });
  }
});

// Then, the dynamic route
router.get('/:eventId', async (req, res) => {
  try {
    console.log('Fetching event details for ID:', req.params.eventId);
    
    const event = await Event.findById(req.params.eventId);
    console.log('Found event:', event);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event details' });
  }
});

// RSVP for an event
router.post('/:eventId/rsvp', auth, async (req, res) => {
  try {
    // Convert string IDs to ObjectIds
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const eventId = new mongoose.Types.ObjectId(req.params.eventId);

    console.log('RSVP attempt:', { userId, eventId });

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Initialize registeredUsers if it doesn't exist
    if (!event.registeredUsers) {
      event.registeredUsers = [];
    }

    // Check if user is already registered
    const alreadyRegistered = event.registeredUsers.some(
      reg => reg && reg.userId && reg.userId.toString() === userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity
    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Add registration
    const seatNumber = event.registeredUsers.length + 1;
    event.registeredUsers.push({
      userId: userId,
      seatNumber: seatNumber
    });

    const savedEvent = await event.save();
    console.log('RSVP successful:', {
      eventId: savedEvent._id,
      userId: userId,
      seatNumber: seatNumber,
      totalRegistered: savedEvent.registeredUsers.length
    });

    res.json({
      success: true,
      message: 'Successfully registered for event',
      seatNumber: seatNumber
    });

  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message
    });
  }
});

// Cancel RSVP
router.delete('/:eventId/rsvp', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(
      userId => userId.toString() !== req.user.id
    );
    await event.save();

    res.json({ message: 'Successfully cancelled registration' });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

// Update event (admin only)
router.put('/:eventId', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('Received update request:', {
      body: req.body,
      file: req.file
    });

    let updateData = {};

    // Add basic fields
    const basicFields = ['title', 'date', 'time', 'location', 'description', 'category', 'capacity'];
    basicFields.forEach(field => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    // Parse JSON fields
    try {
      if (req.body.schedule) {
        updateData.schedule = JSON.parse(req.body.schedule);
      }
      if (req.body.venue) {
        updateData.venue = JSON.parse(req.body.venue);
      }
      if (req.body.additionalDetails) {
        updateData.additionalDetails = JSON.parse(req.body.additionalDetails);
      }
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      return res.status(400).json({ message: 'Invalid JSON in request body' });
    }

    // Add image if uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    console.log('Final update data:', updateData);

    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log('Updated event:', event);
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      message: 'Error updating event',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete event (admin only)
router.delete('/:eventId', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router; 