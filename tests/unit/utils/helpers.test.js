const {
  formatDate,
  formatCurrency,
  generateApiKey,
  generateVerificationToken,
  parseErrorMessage,
} = require('../../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid');
      expect(result).toBeDefined();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });

    it('should handle negative values', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });

  describe('generateApiKey', () => {
    it('should generate unique API keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      
      expect(key1).not.toBe(key2);
      expect(key1.length).toBeGreaterThan(20);
      expect(key2.length).toBeGreaterThan(20);
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate unique verification tokens', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(10);
      expect(token2.length).toBeGreaterThan(10);
    });
  });

  describe('parseErrorMessage', () => {
    it('should parse error messages correctly', () => {
      const error = new Error('Test error');
      const message = parseErrorMessage(error);
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should handle non-error objects', () => {
      const message = parseErrorMessage('Simple error string');
      expect(typeof message).toBe('string');
    });
  });
});
