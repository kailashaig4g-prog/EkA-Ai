# Testing Guide

## Overview

EkA-Ai uses Jest and Supertest for comprehensive testing. We aim for 80%+ code coverage.

## Test Structure

```
tests/
├── setup.js                    # Test configuration
├── unit/                       # Unit tests
│   ├── controllers/           # Controller tests
│   ├── middleware/            # Middleware tests
│   ├── services/              # Service tests
│   └── utils/                 # Utility tests
├── integration/                # Integration tests
│   ├── api/                   # API endpoint tests
│   └── database/              # Database tests
├── e2e/                       # End-to-end tests
└── load/                      # Load/performance tests
```

## Running Tests

### All Tests
```bash
npm test
```

### With Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Test Suite
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Specific file
npm test -- tests/unit/controllers/authController.test.js
```

## Writing Tests

### Unit Test Example

```javascript
const { getUserById } = require('../../src/controllers/userController');
const User = require('../../src/models/User');

describe('UserController', () => {
  describe('getUserById', () => {
    it('should return user when valid ID provided', async () => {
      // Arrange
      const mockUser = { id: '123', name: 'Test User' };
      User.findById = jest.fn().resolv(mockUser);
      
      // Act
      const result = await getUserById('123');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('123');
    });
  });
});
```

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  it('POST /api/v1/auth/register - should create new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('token');
  });
});
```

## Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Controllers | 90%+ |
| Services | 85%+ |
| Middleware | 90%+ |
| Utilities | 85%+ |
| Models | 80%+ |
| **Overall** | **80%+** |

## Best Practices

### 1. Test Organization

- One test file per source file
- Group related tests with `describe`
- Use clear, descriptive test names
- Follow Arrange-Act-Assert pattern

### 2. Mocking

```javascript
// Mock external services
jest.mock('../../src/services/openaiService');

// Mock database calls
jest.spyOn(User, 'findById').mockResolvedValue(mockUser);
```

### 3. Test Data

```javascript
// Use factories or fixtures
const createMockUser = (overrides = {}) => ({
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

### 4. Cleanup

```javascript
beforeEach(async () => {
  // Clean database before each test
  await User.deleteMany({});
});

afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
});
```

## Testing Strategies

### Unit Testing

**What to test:**
- Individual functions
- Edge cases
- Error handling
- Input validation

**What NOT to test:**
- External libraries
- Database internals
- Third-party APIs (use mocks)

### Integration Testing

**What to test:**
- API endpoints
- Database operations
- Service interactions
- Authentication flows

### E2E Testing

**What to test:**
- Complete user flows
- Critical paths
- Multi-step processes

Example:
```javascript
describe('Complete Vehicle Service Flow', () => {
  it('should register, add vehicle, and create service record', async () => {
    // 1. Register user
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);
    
    const token = registerRes.body.data.token;
    
    // 2. Add vehicle
    const vehicleRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);
    
    const vehicleId = vehicleRes.body.data.vehicle.id;
    
    // 3. Create service record
    const serviceRes = await request(app)
      .post(`/api/v1/vehicles/${vehicleId}/service-history`)
      .set('Authorization', `Bearer ${token}`)
      .send(serviceData);
    
    expect(serviceRes.status).toBe(201);
  });
});
```

## Load Testing

### Using Artillery

```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: '/api/v1/auth/login'
          json:
            email: 'test@example.com'
            password: 'password'
```

Run load test:
```bash
artillery run tests/load/load-test.yml
```

## CI/CD Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Scheduled nightly builds

### GitHub Actions

```yaml
- name: Run tests
  run: npm test -- --coverage
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should register user"
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Output
```bash
npm test -- --verbose
```

## Common Issues

### MongoDB Connection

```javascript
// Ensure proper cleanup
afterAll(async () => {
  await mongoose.connection.close();
});
```

### Timeout Errors

```javascript
// Increase timeout for slow tests
it('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Port Conflicts

```javascript
// Use random ports in tests
const port = process.env.PORT || Math.floor(Math.random() * 10000) + 3000;
```

## Coverage Reports

### View Coverage
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

Happy testing! 🧪
