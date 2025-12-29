const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const config = require('./config');

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create uploads subdirectories if they don't exist
const uploadsSubDirs = ['audio', 'images', 'vision'];
uploadsSubDirs.forEach(subDir => {
  const subDirPath = path.join(uploadsDir, subDir);
  if (!fs.existsSync(subDirPath)) {
    fs.mkdirSync(subDirPath, { recursive: true });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO if enabled
let io = null;
if (config.features.websocket) {
  io = socketIO(server, {
    cors: {
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    },
  });

  // Setup socket handlers
  require('./sockets')(io);
  
  // Make io accessible to routes
  app.set('io', io);
  
  logger.info('Socket.IO initialized');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);
  server.close(() => process.exit(1));
});

// Validate critical environment variables
const requiredEnvVars = ['OPENAI_API_KEY', 'MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional)
    if (config.features.caching) {
      try {
        connectRedis();
      } catch (error) {
        logger.warn('Redis connection failed, continuing without caching');
      }
    }

    // Start Express server
    const PORT = config.port;
    server.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      if (config.features.websocket) {
        logger.info(`WebSocket enabled on port ${PORT}`);
      }
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

startServer();

module.exports = { app, io };
