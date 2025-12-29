const { mockOpenAI } = require('../../mocks/openaiMock');

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});

const openaiService = require('../../../src/services/openaiService');

describe('OpenAI Service', () => {
  describe('generateResponse', () => {
    it('should generate AI response', async () => {
      const message = 'How do I change my oil?';
      const response = await openaiService.generateResponse(message);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle empty messages', async () => {
      const response = await openaiService.generateResponse('');
      expect(response).toBeDefined();
    });

    it('should handle complex queries', async () => {
      const message = 'What is the recommended oil change interval for a 2020 Toyota Camry?';
      const response = await openaiService.generateResponse(message);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });
  });

  describe('generateSuggestions', () => {
    it('should generate chat suggestions', async () => {
      const suggestions = await openaiService.generateSuggestions();

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeVehicleIssue', () => {
    it('should analyze vehicle issues', async () => {
      const issue = 'My car is making a strange noise';
      const vehicleData = {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      const analysis = await openaiService.analyzeVehicleIssue(issue, vehicleData);

      expect(analysis).toBeDefined();
      expect(typeof analysis).toBe('string');
    });
  });
});
