import { apiClient } from '../api-client';

export const uploadAPI = {
  uploadFile: async (file: File, endpoint: string = '/upload') => {
    console.log(`📤 Uploading file: ${file.name} to real backend`);

    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📊 Upload progress: ${progress}%`);
        }
      },
    });
    return response.data;
  }
};