import axios from './axios';

export const chatApi = {
  sendMessage: async (message) => {
    const response = await axios.post('/chat', { message });
    return response.data;
  },

  getSuggestions: async () => {
    const response = await axios.get('/chat/suggestions');
    return response.data;
  },
};
