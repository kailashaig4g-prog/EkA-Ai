#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Vehicle = require('../src/models/Vehicle');

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Vehicle.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@eka-ai.com',
      password: adminPassword,
      role: 'admin',
      emailVerified: true,
    });

    console.log('Admin user created:', admin.email);

    // Create sample user
    console.log('Creating sample user...');
    const userPassword = await bcrypt.hash('User123!', 12);
    const user = await User.create({
      name: 'John Doe',
      email: 'user@example.com',
      password: userPassword,
      emailVerified: true,
    });

    console.log('Sample user created:', user.email);

    // Create sample vehicles
    console.log('Creating sample vehicles...');
    await Vehicle.create([
      {
        user: user._id,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'SAMPLE1234567890A',
        licensePlate: 'ABC123',
        color: 'Silver',
        mileage: 50000,
      },
      {
        user: user._id,
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        vin: 'SAMPLE1234567890B',
        licensePlate: 'XYZ789',
        color: 'Blue',
        mileage: 35000,
      },
    ]);

    console.log('Sample vehicles created!');
    console.log('\nSeed data created successfully!');
    console.log('\nCredentials:');
    console.log('Admin - Email:', admin.email, 'Password:', process.env.ADMIN_PASSWORD || 'Admin123!');
    console.log('User - Email:', user.email, 'Password: User123!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
