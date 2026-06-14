import axios from 'axios';
import { apiClient } from '../api-client';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';

export const healthAPI = {
  // Check backend health
  check: async () => {
    console.log('🏥 Checking backend health at:', BACKEND_URL);
    const response = await axios.get(`${BACKEND_URL}/health`);
    return response.data;
  },

  // Get API information
  getInfo: async () => {
    console.log('ℹ️ Getting API info from:', API_BASE_URL);
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  }
};