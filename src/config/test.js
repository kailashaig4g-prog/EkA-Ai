module.exports = {
  env: 'test',
  
  server: {
    port: 5001,
  },

  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eka-ai-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  redis: {
    host: 'localhost',
    port: 6379,
  },

  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h',
    refreshSecret: 'test-refresh-secret',
    refreshExpiresIn: '2h',
  },

  cors: {
    origin: '*',
    credentials: true,
  },

  rateLimit: {
    windowMs: 900000,
    max: 10000,
  },

  logging: {
    level: 'error',
  },
};
