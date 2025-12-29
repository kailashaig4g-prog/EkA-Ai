import { useState, useEffect } from 'react';
import { vehicleApi } from '../../api/vehicleApi';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

export const VehicleForm = ({ vehicle, onClose }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    licensePlate: '',
    color: '',
    mileage: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        color: vehicle.color || '',
        mileage: vehicle.mileage || '',
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.vin.trim()) newErrors.vin = 'VIN is required';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      if (vehicle) {
        await vehicleApi.updateVehicle(vehicle._id, formData);
      } else {
        await vehicleApi.createVehicle(formData);
      }
      onClose(true);
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          error={errors.make}
          required
        />

        <Input
          label="Model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          error={errors.model}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Year"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          error={errors.year}
          required
        />

        <Input
          label="Color"
          name="color"
          value={formData.color}
          onChange={handleChange}
        />
      </div>

      <Input
        label="VIN"
        name="vin"
        value={formData.vin}
        onChange={handleChange}
        error={errors.vin}
        required
      />

      <Input
        label="License Plate"
        name="licensePlate"
        value={formData.licensePlate}
        onChange={handleChange}
      />

      <Input
        label="Mileage"
        name="mileage"
        type="number"
        value={formData.mileage}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : vehicle ? 'Update' : 'Add'}
        </Button>
      </div>
    </form>
  );
};
