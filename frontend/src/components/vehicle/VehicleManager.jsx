import { useState, useCallback, useEffect } from 'react';
import { useVehicle } from '../../contexts/VehicleContext';
import { VehicleForm } from './VehicleForm';
import { VehicleCard } from './VehicleCard';
import { Modal } from '../shared/Modal';

/**
 * VehicleManager - Full CRUD modal for vehicle management
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 */
export const VehicleManager = ({ isOpen, onClose }) => {
  const {
    vehicles = [],
    activeVehicle,
    isLoading,
    error,
    loadVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimary,
    selectVehicle,
  } = useVehicle();

  // Ensure vehicles is always an array
  const vehicleList = Array.isArray(vehicles) ? vehicles : [];

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Load vehicles when modal opens
  useEffect(() => {
    if (isOpen) {
      loadVehicles();
    }
  }, [isOpen, loadVehicles]);

  // Handle add new vehicle
  const handleAdd = useCallback(() => {
    setEditingVehicle(null);
    setShowForm(true);
  }, []);

  // Handle edit vehicle
  const handleEdit = useCallback((vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  }, []);

  // Handle save (add or update)
  const handleSave = useCallback(async (formData) => {
    let result;
    if (editingVehicle) {
      result = await updateVehicle(editingVehicle._id, formData);
    } else {
      result = await addVehicle(formData);
    }

    if (result.success) {
      setShowForm(false);
      setEditingVehicle(null);
    }
  }, [editingVehicle, addVehicle, updateVehicle]);

  // Handle cancel form
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingVehicle(null);
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id) => {
    await deleteVehicle(id);
  }, [deleteVehicle]);

  // Handle set primary
  const handleSetPrimary = useCallback(async (id) => {
    await setPrimary(id);
  }, [setPrimary]);

  // Handle select vehicle
  const handleSelect = useCallback((vehicle) => {
    selectVehicle(vehicle);
  }, [selectVehicle]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      data-testid="vehicle-manager"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl rounded-2xl p-6 animate-slide-up"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {showForm ? (editingVehicle ? 'Edit Vehicle' : 'Add Vehicle') : 'My Vehicles'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {showForm
                  ? 'Fill in your vehicle details'
                  : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} registered`
                }
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
            >
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="mb-4 p-4 rounded-xl text-sm flex items-center gap-2"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Content */}
          {showForm ? (
            <VehicleForm
              vehicle={editingVehicle}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <>
              {/* Vehicle Grid */}
              {vehicles.length === 0 ? (
                <div className="text-center py-12">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    No vehicles yet
                  </h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Add your first vehicle to get personalized AI assistance
                  </p>
                  <button
                    onClick={handleAdd}
                    className="px-6 py-3 rounded-xl font-medium transition-all"
                    style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
                    data-testid="add-first-vehicle-btn"
                  >
                    Add Your First Vehicle
                  </button>
                </div>
              ) : (
                <>
                  {/* Add Button */}
                  <button
                    onClick={handleAdd}
                    className="w-full mb-4 p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    data-testid="add-vehicle-btn"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Another Vehicle
                  </button>

                  {/* Vehicle Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {vehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle._id}
                        vehicle={vehicle}
                        isActive={activeVehicle?._id === vehicle._id}
                        isPrimary={vehicle.isPrimary}
                        onSelect={handleSelect}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSetPrimary={handleSetPrimary}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Loading Overlay */}
          {isLoading && !showForm && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/80 rounded-2xl">
              <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleManager;
