import { memo } from 'react';
import { FUEL_TYPES } from '../../contexts/VehicleContext';

/**
 * VehicleCard - Display card for a single vehicle
 * @param {Object} props
 * @param {Object} props.vehicle - Vehicle data
 * @param {boolean} props.isActive - Whether this vehicle is active
 * @param {boolean} props.isPrimary - Whether this is the primary vehicle
 * @param {Function} props.onSelect - Callback when vehicle is selected
 * @param {Function} props.onEdit - Callback to edit vehicle
 * @param {Function} props.onDelete - Callback to delete vehicle
 * @param {Function} props.onSetPrimary - Callback to set as primary
 */
export const VehicleCard = memo(({
  vehicle,
  isActive,
  isPrimary,
  onSelect,
  onEdit,
  onDelete,
  onSetPrimary,
}) => {
  const fuelLabel = FUEL_TYPES.find((f) => f.value === vehicle.fuelType)?.label || vehicle.fuelType;

  // Get fuel type badge color
  const getFuelBadgeStyle = () => {
    switch (vehicle.fuelType) {
      case 'electric':
        return { bg: 'rgba(65, 126, 70, 0.1)', color: 'var(--brand-secondary)' };
      case 'hybrid':
        return { bg: 'rgba(65, 126, 70, 0.15)', color: 'var(--brand-secondary)' };
      case 'petrol':
        return { bg: 'rgba(87, 6, 131, 0.1)', color: 'var(--brand-primary)' };
      case 'diesel':
        return { bg: 'rgba(0, 0, 0, 0.08)', color: 'var(--text-secondary)' };
      case 'cng':
      case 'petrol_cng':
        return { bg: 'rgba(223, 140, 77, 0.1)', color: 'var(--brand-accent)' };
      default:
        return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
    }
  };

  const fuelBadgeStyle = getFuelBadgeStyle();

  return (
    <div
      onClick={() => onSelect?.(vehicle)}
      className={`relative rounded-2xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md ${
        isActive ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border)'}`,
        boxShadow: isActive ? '0 4px 16px rgba(87, 6, 131, 0.15)' : 'var(--shadow-sm)',
        ringColor: 'var(--brand-primary)',
      }}
      data-testid={`vehicle-card-${vehicle._id}`}
    >
      {/* Primary Star Badge */}
      {isPrimary && (
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--brand-accent)', color: 'white' }}
          title="Primary Vehicle"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* Vehicle Info */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {vehicle.year} {vehicle.variant && `• ${vehicle.variant}`}
        </p>
      </div>

      {/* Details Row */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Fuel Type Badge */}
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: fuelBadgeStyle.bg,
            color: fuelBadgeStyle.color,
          }}
        >
          {vehicle.fuelType === 'electric' && '⚡ '}
          {fuelLabel}
        </span>

        {/* Registration */}
        {vehicle.registrationNumber && (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium uppercase"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            {vehicle.registrationNumber}
          </span>
        )}
      </div>

      {/* Odometer */}
      {(vehicle.mileage || vehicle.odometer) && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Odometer: {(vehicle.mileage || vehicle.odometer).toLocaleString()} km
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {!isPrimary && onSetPrimary && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetPrimary(vehicle._id);
            }}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
            data-testid="set-primary-btn"
          >
            Set Primary
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(vehicle);
          }}
          className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--brand-primary)' }}
          data-testid="edit-btn"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this vehicle?')) {
              onDelete?.(vehicle._id);
            }
          }}
          className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          style={{ color: '#dc2626' }}
          data-testid="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

VehicleCard.displayName = 'VehicleCard';

export default VehicleCard;
