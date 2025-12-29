import { useState, useEffect } from 'react';
import { vehicleApi } from '../../api/vehicleApi';
import { Button } from '../shared/Button';
import { Loading } from '../shared/Loading';
import { VehicleForm } from './VehicleForm';
import { Modal } from '../shared/Modal';

export const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await vehicleApi.getVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleApi.deleteVehicle(id);
        loadVehicles();
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  const handleFormClose = (refresh) => {
    setShowForm(false);
    setSelectedVehicle(null);
    if (refresh) {
      loadVehicles();
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Vehicles
        </h2>
        <Button onClick={handleAdd}>Add Vehicle</Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">No vehicles found</p>
          <Button onClick={handleAdd} className="mt-4">
            Add Your First Vehicle
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {vehicle.make} {vehicle.model}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>Year: {vehicle.year}</p>
                <p>VIN: {vehicle.vin}</p>
                {vehicle.licensePlate && <p>Plate: {vehicle.licensePlate}</p>}
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(vehicle)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(vehicle._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => handleFormClose(false)} title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <VehicleForm vehicle={selectedVehicle} onClose={handleFormClose} />
      </Modal>
    </div>
  );
};
