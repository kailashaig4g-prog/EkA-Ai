/**
 * Generate mock user data
 */
const mockUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecurePass123!',
  ...overrides,
});

/**
 * Generate mock vehicle data
 */
const mockVehicle = (userId, overrides = {}) => ({
  user: userId,
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  vin: 'TEST1234567890123',
  licensePlate: 'ABC123',
  color: 'Silver',
  mileage: 50000,
  ...overrides,
});

/**
 * Generate mock service history data
 */
const mockServiceHistory = (vehicleId, overrides = {}) => ({
  vehicle: vehicleId,
  serviceType: 'Oil Change',
  description: 'Regular oil change service',
  date: new Date(),
  mileage: 50000,
  cost: 50.00,
  workshop: 'Test Workshop',
  ...overrides,
});

/**
 * Generate mock chat message data
 */
const mockChatMessage = (overrides = {}) => ({
  message: 'How do I change my oil?',
  ...overrides,
});

/**
 * Generate JWT token for testing
 * IMPORTANT: Only use in test environment with properly configured test secrets
 */
const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET;
  
  if (!secret && process.env.NODE_ENV !== 'test') {
    throw new Error('JWT_SECRET must be set for token generation');
  }
  
  return jwt.sign({ id: userId }, secret || 'test-secret-key-do-not-use-in-production', {
    expiresIn: '1h',
  });
};

module.exports = {
  mockUser,
  mockVehicle,
  mockServiceHistory,
  mockChatMessage,
  generateTestToken,
};
