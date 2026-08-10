const mongoose = require('mongoose');
const { mongoUri, nodeEnv } = require('./env');

mongoose.connection.on('connected', () => console.info('MongoDB connection established.'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB connection disconnected.'));
mongoose.connection.on('error', (error) => console.error('MongoDB connection error:', error.message));

const connectDB = async () => {
  const conn = await mongoose.connect(mongoUri, {
    autoIndex: nodeEnv !== 'production',
    serverSelectionTimeoutMS: 10000,
  });

  console.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
