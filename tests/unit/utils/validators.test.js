const {
  registerValidator,
  loginValidator,
  vehicleValidator,
  chatValidator,
  mongoIdValidator,
} = require('../../../src/utils/validators');

describe('Validators', () => {
  describe('registerValidator', () => {
    it('should contain name validation', () => {
      expect(registerValidator.length).toBeGreaterThan(0);
      const nameValidator = registerValidator.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('name')
      );
      expect(nameValidator).toBeDefined();
    });

    it('should contain email validation', () => {
      const emailValidator = registerValidator.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('email')
      );
      expect(emailValidator).toBeDefined();
    });

    it('should contain password validation', () => {
      const passwordValidator = registerValidator.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('password')
      );
      expect(passwordValidator).toBeDefined();
    });
  });

  describe('loginValidator', () => {
    it('should contain email validation', () => {
      expect(loginValidator.length).toBeGreaterThan(0);
      const emailValidator = loginValidator.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('email')
      );
      expect(emailValidator).toBeDefined();
    });

    it('should contain password validation', () => {
      const passwordValidator = loginValidator.find(v => 
        v.builder && v.builder.fields && v.builder.fields.includes('password')
      );
      expect(passwordValidator).toBeDefined();
    });
  });

  describe('vehicleValidator', () => {
    it('should validate vehicle fields', () => {
      expect(vehicleValidator.length).toBeGreaterThan(0);
    });
  });

  describe('chatValidator', () => {
    it('should validate chat message', () => {
      expect(chatValidator.length).toBeGreaterThan(0);
    });
  });

  describe('mongoIdValidator', () => {
    it('should validate MongoDB ObjectId', () => {
      expect(mongoIdValidator.length).toBeGreaterThan(0);
    });
  });
});
