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
 */
const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
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
