// src/axiosConfig.ts

import axios from 'axios';
import { notificationService } from 'src/services/notificationService';

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: 'https://erp.ts-egy.com/api', // You can also import this from your Redux store if needed
});

// Function to set up interceptors with access to the Redux store
export const setupInterceptors = (store: any) => {
  // Request interceptor to add Authorization header
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.token; // Get the token from Redux store
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // Handle request errors
      notificationService.notify({
        message: 'An error occurred while making the request.',
        severity: 'error',
        title: 'Request Error',
      });
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle responses globally
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || error.message || 'An error occurred';

      if (status === 401) {
        // Unauthorized: Notify and optionally handle redirection
        notificationService.notify({
          message: 'Unauthorized access. Please log in again.',
          severity: 'error',
          title: 'Authentication Error',
        });
        // Optionally, implement redirection to login here
      } else if (status >= 500) {
        // Server errors
        notificationService.notify({
          message: 'Server error. Please try again later.',
          severity: 'error',
          title: 'Server Error',
        });
      } else {
        // Other errors
        notificationService.notify({
          message: message,
          severity: 'error',
          title: 'Error',
        });
      }

      return Promise.reject(error);
    }
  );
};

export default api;
