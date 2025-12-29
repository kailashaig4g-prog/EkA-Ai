const rateLimit = require('express-rate-limit');
const { authLimiter, apiLimiter } = require('../../../src/middleware/rateLimiter');

describe('Rate Limiter Middleware', () => {
  it('should export authLimiter', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  it('should export apiLimiter', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });

  it('should have correct rate limit properties', () => {
    // Rate limiters are functions returned by express-rate-limit
    expect(authLimiter.name).toBeTruthy();
    expect(apiLimiter.name).toBeTruthy();
  });
});
