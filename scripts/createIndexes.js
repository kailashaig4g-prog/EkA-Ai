#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\nCreating indexes for all models...');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\nProcessing collection: ${collectionName}`);
      
      try {
        const result = await mongoose.connection.db
          .collection(collectionName)
          .createIndexes([]);
        console.log(`Indexes created for ${collectionName}`);
      } catch (error) {
        console.error(`Error creating indexes for ${collectionName}:`, error.message);
      }
    }

    // Load models to ensure their indexes are created
    require('../src/models/User');
    require('../src/models/Vehicle');
    require('../src/models/ServiceHistory');
    require('../src/models/Workshop');
    require('../src/models/Notification');

    console.log('\nAll indexes created successfully!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
