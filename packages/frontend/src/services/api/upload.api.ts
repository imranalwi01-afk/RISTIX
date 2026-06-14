import { apiClient } from '../api-client';

export const uploadAPI = {
  uploadFile: async (file: File, endpoint: string = '/upload') => {

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      },
    });
    return response.data;
  }
};