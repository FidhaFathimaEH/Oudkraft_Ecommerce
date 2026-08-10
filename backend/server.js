require('dotenv').config();
const app = require('./src/app');
const { port, nodeEnv } = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');

let server;
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDB();
  logger.info('Backend shut down cleanly.');
  process.exit(0);
};

const start = async () => {
  try {
    await connectDB();
    server = app.listen(port, () => logger.info(`Oud Kraft API listening on port ${port} (${nodeEnv}).`));
  } catch (error) {
    logger.error('Unable to start API: MongoDB connection failed.', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => { logger.error('Unhandled promise rejection.', error); shutdown('unhandledRejection'); });

start();
