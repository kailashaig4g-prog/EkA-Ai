import axios from './axios';

export const vehicleApi = {
  getVehicles: async () => {
    const response = await axios.get('/vehicles');
    return response.data;
  },

  getVehicle: async (id) => {
    const response = await axios.get(`/vehicles/${id}`);
    return response.data;
  },

  createVehicle: async (vehicleData) => {
    const response = await axios.post('/vehicles', vehicleData);
    return response.data;
  },

  updateVehicle: async (id, vehicleData) => {
    const response = await axios.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id) => {
    const response = await axios.delete(`/vehicles/${id}`);
    return response.data;
  },
};
