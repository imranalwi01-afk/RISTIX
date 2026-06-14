import axios from 'axios';
import { apiClient } from '../api-client';
import { API_BASE_URL, BACKEND_URL } from '../api-setup';

export const healthAPI = {
  // Check backend health
  check: async () => {
    const response = await axios.get(`${BACKEND_URL}/health`);
    return response.data;
  },

  // Get API information
  getInfo: async () => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  }
};