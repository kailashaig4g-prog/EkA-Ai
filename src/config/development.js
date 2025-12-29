module.exports = {
  env: 'development',
  
  server: {
    port: process.env.PORT || 5000,
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eka-ai',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: '30d',
  },

  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
  },

  rateLimit: {
    windowMs: 900000,
    max: 1000, // More permissive in development
  },

  logging: {
    level: 'debug',
  },
};
