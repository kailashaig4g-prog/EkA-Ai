const request = require('supertest');
const app = require('../../../src/app');
const { mockOpenAI } = require('../../mocks/openaiMock');
const { generateTestToken, mockUser } = require('../../helpers/mockData');

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});

describe('Chat Controller', () => {
  let token;

  beforeAll(() => {
    // Generate a test token
    token = generateTestToken('test-user-id');
  });

  describe('POST /api/v1/chat', () => {
    it('should send a message and get AI response', async () => {
      const res = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'How do I change my oil?' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('response');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/chat')
        .send({ message: 'Test message' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail without message', async () => {
      const res = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/chat/suggestions', () => {
    it('should get chat suggestions', async () => {
      const res = await request(app)
        .get('/api/v1/chat/suggestions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('suggestions');
      expect(Array.isArray(res.body.data.suggestions)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/chat/suggestions')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
