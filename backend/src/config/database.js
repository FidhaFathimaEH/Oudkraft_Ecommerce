const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    if (nodeEnv !== 'test') {
      console.log(`MongoDB connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
