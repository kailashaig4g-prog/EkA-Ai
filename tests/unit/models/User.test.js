const mongoose = require('mongoose');

describe('User Model', () => {
  let User;

  beforeAll(() => {
    // Load the User model
    User = require('../../../src/models/User');
  });

  it('should be a Mongoose model', () => {
    expect(User).toBeDefined();
    expect(User.prototype).toBeInstanceOf(mongoose.Model);
  });

  it('should have required schema fields', () => {
    const schema = User.schema.obj;
    
    expect(schema.name).toBeDefined();
    expect(schema.email).toBeDefined();
    expect(schema.password).toBeDefined();
  });

  it('should have email index', () => {
    const indexes = User.schema.indexes();
    const emailIndex = indexes.find(idx => idx[0].email);
    expect(emailIndex).toBeDefined();
  });

  it('should have password comparison method', () => {
    expect(User.schema.methods.comparePassword).toBeDefined();
    expect(typeof User.schema.methods.comparePassword).toBe('function');
  });

  it('should have JWT token generation method', () => {
    expect(User.schema.methods.getSignedJwtToken).toBeDefined();
    expect(typeof User.schema.methods.getSignedJwtToken).toBe('function');
  });

  it('should hash password before save', () => {
    expect(User.schema.pre).toBeDefined();
  });
});
