const mongoose = require('mongoose');

describe('Vehicle Model', () => {
  let Vehicle;

  beforeAll(() => {
    Vehicle = require('../../../src/models/Vehicle');
  });

  it('should be a Mongoose model', () => {
    expect(Vehicle).toBeDefined();
    expect(Vehicle.prototype).toBeInstanceOf(mongoose.Model);
  });

  it('should have required schema fields', () => {
    const schema = Vehicle.schema.obj;
    
    expect(schema.user).toBeDefined();
    expect(schema.make).toBeDefined();
    expect(schema.model).toBeDefined();
    expect(schema.year).toBeDefined();
    expect(schema.vin).toBeDefined();
  });

  it('should have VIN index', () => {
    const indexes = Vehicle.schema.indexes();
    const vinIndex = indexes.find(idx => idx[0].vin);
    expect(vinIndex).toBeDefined();
  });

  it('should have user reference', () => {
    const userField = Vehicle.schema.obj.user;
    expect(userField.type).toBe(mongoose.Schema.Types.ObjectId);
    expect(userField.ref).toBe('User');
  });

  it('should have timestamps', () => {
    expect(Vehicle.schema.options.timestamps).toBe(true);
  });
});
