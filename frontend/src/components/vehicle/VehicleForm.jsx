import { useState, useCallback, memo } from 'react';
import { VEHICLE_MAKES, FUEL_TYPES, VEHICLE_TYPES } from '../../contexts/VehicleContext';

/**
 * VehicleForm - Add/Edit form for vehicles
 * @param {Object} props
 * @param {Object} props.vehicle - Existing vehicle data (for edit mode)
 * @param {Function} props.onSave - Callback with form data
 * @param {Function} props.onCancel - Callback to cancel
 * @param {boolean} props.isLoading - Loading state
 */
export const VehicleForm = memo(({ vehicle, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    variant: vehicle?.variant || '',
    year: vehicle?.year || new Date().getFullYear(),
    fuelType: vehicle?.fuelType || 'petrol',
    vehicleType: vehicle?.vehicleType || 'car',
    registrationNumber: vehicle?.registrationNumber || '',
    odometer: vehicle?.mileage || vehicle?.odometer || '',
    vin: vehicle?.vin || '',
    color: vehicle?.color || '',
  });

  const [errors, setErrors] = useState({});

  // Generate year options (last 30 years)
  const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model?.trim()) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.fuelType) newErrors.fuelType = 'Fuel type is required';

    // Validate registration format (basic Indian format)
    if (formData.registrationNumber) {
      const regPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/i;
      if (!regPattern.test(formData.registrationNumber.replace(/\s/g, ''))) {
        newErrors.registrationNumber = 'Invalid format (e.g., MH12AB1234)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!validate()) return;

    // Format registration number to uppercase
    const submitData = {
      ...formData,
      registrationNumber: formData.registrationNumber?.toUpperCase().replace(/\s/g, ''),
      odometer: formData.odometer ? parseInt(formData.odometer, 10) : undefined,
      year: parseInt(formData.year, 10),
      mileage: formData.odometer ? parseInt(formData.odometer, 10) : undefined,
    };

    onSave(submitData);
  }, [formData, validate, onSave]);

  const inputClass = `w-full px-4 py-3 rounded-xl transition-all duration-200 bg-[var(--bg-card)] border text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-opacity-50`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="vehicle-form">
      {/* Make & Model Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Make *
          </label>
          <select
            name="make"
            value={formData.make}
            onChange={handleChange}
            className={inputClass}
            style={{ borderColor: errors.make ? '#dc2626' : 'var(--border)' }}
            data-testid="make-select"
          >
            <option value="">Select Make</option>
            {VEHICLE_MAKES.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
          {errors.make && (
            <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{errors.make}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Model *
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g., Swift, Creta, Nexon"
            className={inputClass}
            style={{ borderColor: errors.model ? '#dc2626' : 'var(--border)' }}
            data-testid="model-input"
          />
          {errors.model && (
            <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{errors.model}</p>
          )}
        </div>
      </div>

      {/* Variant & Year Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Variant
          </label>
          <input
            type="text"
            name="variant"
            value={formData.variant}
            onChange={handleChange}
            placeholder="e.g., VXI, SX(O), XZ+"
            className={inputClass}
            style={{ borderColor: 'var(--border)' }}
            data-testid="variant-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Year *
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={inputClass}
            style={{ borderColor: errors.year ? '#dc2626' : 'var(--border)' }}
            data-testid="year-select"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fuel Type & Vehicle Type Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Fuel Type *
          </label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className={inputClass}
            style={{ borderColor: 'var(--border)' }}
            data-testid="fuel-select"
          >
            {FUEL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Vehicle Type
          </label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className={inputClass}
            style={{ borderColor: 'var(--border)' }}
            data-testid="type-select"
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Registration Number */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Registration Number
        </label>
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          placeholder="e.g., MH12AB1234"
          className={`${inputClass} uppercase`}
          style={{ borderColor: errors.registrationNumber ? '#dc2626' : 'var(--border)' }}
          data-testid="registration-input"
        />
        {errors.registrationNumber && (
          <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{errors.registrationNumber}</p>
        )}
      </div>

      {/* Odometer */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Odometer (km)
        </label>
        <input
          type="number"
          name="odometer"
          value={formData.odometer}
          onChange={handleChange}
          placeholder="e.g., 45000"
          min="0"
          className={inputClass}
          style={{ borderColor: 'var(--border)' }}
          data-testid="odometer-input"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-medium transition-colors"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
          data-testid="cancel-btn"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
          }}
          data-testid="save-btn"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </span>
          ) : vehicle ? (
            'Update Vehicle'
          ) : (
            'Add Vehicle'
          )}
        </button>
      </div>
    </form>
  );
});

VehicleForm.displayName = 'VehicleForm';

export default VehicleForm;
