const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});

    // Create admin user
    const hashedPassword = await bcrypt.hash('Manchini12', 10);
    const adminUser = await User.create({
      name: "Roberto Owusu Ampiah",
      email: "robertowusuampiah@gmail.com",
      password: hashedPassword,
      isAdmin: true
    });

    console.log('Admin user created:', adminUser);

    // Create events
    const events = [
      {
        title: "Tech Innovation Summit",
        date: new Date("2024-02-15"),
        time: "10:00",
        location: "UG Computer Science Building",
        description: "Join us for a day of tech talks, workshops, and networking with industry leaders.",
        category: "technology",
        capacity: 200,
        isPrivate: false,
        registrationDeadline: new Date("2024-02-13"),
        createdBy: adminUser._id,
        registeredUsers: [],
        imageUrl: "/images/webpage2.jpg"
      },
      {
        title: "Music Festival",
        date: new Date("2024-02-20"),
        time: "14:00",
        location: "Pent Block B",
        description: "Experience an amazing evening of live music performances and entertainment.",
        category: "social",
        capacity: 500,
        isPrivate: false,
        registrationDeadline: new Date("2024-02-18"),
        createdBy: adminUser._id,
        registeredUsers: [],
        imageUrl: "/images/webpage3.jpg"
      },
      {
        title: "Cultural Night",
        date: new Date("2024-02-25"),
        time: "18:00",
        location: "Great Hall",
        description: "Experience diverse cultural performances, food, and traditions.",
        category: "cultural",
        capacity: 300,
        isPrivate: false,
        registrationDeadline: new Date("2024-02-23"),
        createdBy: adminUser._id,
        registeredUsers: [],
        imageUrl: "/images/webpage4.jpg"
      }
    ];

    const createdEvents = await Event.insertMany(events);
    console.log('Events created:', createdEvents);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 