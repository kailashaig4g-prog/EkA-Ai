import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { useAuth } from './AuthContext';

const VehicleContext = createContext(null);

// Indian vehicle makes
export const VEHICLE_MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Kia',
  'Honda',
  'Toyota',
  'MG',
  'Skoda',
  'Volkswagen',
  'Renault',
  'Nissan',
  'Ford',
  'Jeep',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Volvo',
  'Jaguar',
  'Land Rover',
  'Hero',
  'TVS',
  'Bajaj',
  'Royal Enfield',
  'Honda (Two Wheeler)',
  'Yamaha',
  'Suzuki (Two Wheeler)',
  'KTM',
  'Ather',
  'Ola Electric',
  'Other',
];

// Fuel types
export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'petrol_cng', label: 'Petrol + CNG' },
];

// Vehicle types
export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'mpv', label: 'MPV' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'electric_scooter', label: 'Electric Scooter' },
  { value: 'electric_bike', label: 'Electric Bike' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
];

/**
 * VehicleProvider - Manages vehicle state globally
 */
export const VehicleProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load vehicles when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadVehicles();
    } else {
      setVehicles([]);
      setActiveVehicle(null);
    }
  }, [isAuthenticated]);

  /**
   * Load all vehicles for the user
   */
  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleApi.getVehicles();
      const vehicleList = response.data || [];
      setVehicles(vehicleList);

      // Set first vehicle as active if none selected
      if (vehicleList.length > 0 && !activeVehicle) {
        const primaryVehicle = vehicleList.find((v) => v.isPrimary) || vehicleList[0];
        setActiveVehicle(primaryVehicle);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [activeVehicle]);

  /**
   * Add a new vehicle
   */
  const addVehicle = useCallback(async (vehicleData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleApi.createVehicle(vehicleData);
      const newVehicle = response.data;
      
      setVehicles((prev) => [...prev, newVehicle]);
      
      // Set as active if it's the first vehicle
      if (vehicles.length === 0) {
        setActiveVehicle(newVehicle);
      }
      
      return { success: true, vehicle: newVehicle };
    } catch (err) {
      console.error('Failed to add vehicle:', err);
      setError(err.response?.data?.message || 'Failed to add vehicle');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  }, [vehicles.length]);

  /**
   * Update an existing vehicle
   */
  const updateVehicle = useCallback(async (id, vehicleData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleApi.updateVehicle(id, vehicleData);
      const updatedVehicle = response.data;
      
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? updatedVehicle : v))
      );
      
      // Update active vehicle if it was updated
      if (activeVehicle?._id === id) {
        setActiveVehicle(updatedVehicle);
      }
      
      return { success: true, vehicle: updatedVehicle };
    } catch (err) {
      console.error('Failed to update vehicle:', err);
      setError(err.response?.data?.message || 'Failed to update vehicle');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  }, [activeVehicle]);

  /**
   * Delete a vehicle
   */
  const deleteVehicle = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      await vehicleApi.deleteVehicle(id);
      
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      
      // Clear active vehicle if it was deleted
      if (activeVehicle?._id === id) {
        const remaining = vehicles.filter((v) => v._id !== id);
        setActiveVehicle(remaining[0] || null);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
      setError(err.response?.data?.message || 'Failed to delete vehicle');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setIsLoading(false);
    }
  }, [activeVehicle, vehicles]);

  /**
   * Set primary vehicle
   */
  const setPrimary = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update locally first for optimistic UI
      setVehicles((prev) =>
        prev.map((v) => ({ ...v, isPrimary: v._id === id }))
      );
      
      // Find and set as active
      const vehicle = vehicles.find((v) => v._id === id);
      if (vehicle) {
        setActiveVehicle({ ...vehicle, isPrimary: true });
      }
      
      // API call would go here if endpoint exists
      // await vehicleApi.setPrimary(id);
      
      return { success: true };
    } catch (err) {
      console.error('Failed to set primary vehicle:', err);
      setError('Failed to set primary vehicle');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [vehicles]);

  /**
   * Select a vehicle as active
   */
  const selectVehicle = useCallback((vehicle) => {
    setActiveVehicle(vehicle);
  }, []);

  /**
   * Get vehicle context string for AI prompts
   */
  const getVehicleContext = useCallback(() => {
    if (!activeVehicle) return null;

    const parts = [];
    
    if (activeVehicle.make) parts.push(`Make: ${activeVehicle.make}`);
    if (activeVehicle.model) parts.push(`Model: ${activeVehicle.model}`);
    if (activeVehicle.year) parts.push(`Year: ${activeVehicle.year}`);
    if (activeVehicle.variant) parts.push(`Variant: ${activeVehicle.variant}`);
    if (activeVehicle.fuelType) parts.push(`Fuel Type: ${activeVehicle.fuelType}`);
    if (activeVehicle.vehicleType) parts.push(`Vehicle Type: ${activeVehicle.vehicleType}`);
    if (activeVehicle.registrationNumber) parts.push(`Registration: ${activeVehicle.registrationNumber}`);
    if (activeVehicle.mileage || activeVehicle.odometer) {
      parts.push(`Odometer: ${activeVehicle.mileage || activeVehicle.odometer} km`);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  }, [activeVehicle]);

  /**
   * Get AI prompt instruction for vehicle context
   */
  const getAIPromptInstruction = useCallback(() => {
    const context = getVehicleContext();
    if (!context) return '';

    return `\n\nUser's Vehicle Context: ${context}. Use this information to provide personalized and relevant advice for this specific vehicle.`;
  }, [getVehicleContext]);

  const value = {
    vehicles,
    activeVehicle,
    isLoading,
    error,
    loadVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimary,
    selectVehicle,
    getVehicleContext,
    getAIPromptInstruction,
    VEHICLE_MAKES,
    FUEL_TYPES,
    VEHICLE_TYPES,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicle = () => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
};

export default VehicleContext;
