import { useState } from 'react';
import { Dashboard } from '../components/dashboard/Dashboard';
import { VehicleManager } from '../components/vehicle/VehicleManager';
import { VehicleCard } from '../components/vehicle/VehicleCard';
import { useVehicle } from '../contexts/VehicleContext';

export const VehiclesPage = () => {
  const {
    vehicles = [],
    activeVehicle,
    isLoading,
    selectVehicle,
    deleteVehicle,
    setPrimary,
  } = useVehicle();

  const [showManager, setShowManager] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowManager(true);
  };

  // Ensure vehicles is always an array
  const vehicleList = Array.isArray(vehicles) ? vehicles : [];

  return (
    <Dashboard>
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              My Vehicles
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage your vehicles for personalized AI assistance
            </p>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
            data-testid="manage-vehicles-btn"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Vehicle
          </button>
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 animate-spin" style={{ color: 'var(--brand-primary)' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : vehicleList.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14h14M5 14a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No vehicles registered
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Add your first vehicle to get personalized AI recommendations
            </p>
            <button
              onClick={() => setShowManager(true)}
              className="px-6 py-3 rounded-xl font-medium transition-all"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
            >
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                isActive={activeVehicle?._id === vehicle._id}
                isPrimary={vehicle.isPrimary}
                onSelect={selectVehicle}
                onEdit={handleEdit}
                onDelete={deleteVehicle}
                onSetPrimary={setPrimary}
              />
            ))}
          </div>
        )}
      </div>

      {/* Vehicle Manager Modal */}
      <VehicleManager
        isOpen={showManager}
        onClose={() => {
          setShowManager(false);
          setEditingVehicle(null);
        }}
      />
    </Dashboard>
  );
};

export default VehiclesPage;
