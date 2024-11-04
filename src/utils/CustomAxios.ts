// src/utils/CustomAxios.ts

import axios from 'axios';
import { store } from '../store/Store';
import { clearToken } from '../store/apps/auth/AuthSlice';
import { isTokenExpired } from './auth';

// Create Axios instance
const CustomAxios = axios.create({
  baseURL: 'https://erp.ts-egy.com/api',
});

// Request Interceptor
CustomAxios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    const tokenExpiration = state.auth.tokenExpiration;

    if (token && !isTokenExpired(tokenExpiration)) {
      // Initialize headers if undefined
      if (!config.headers) {
        config.headers = {} as any; // Type assertion
      }

      // Set Authorization header
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    } else if (token && isTokenExpired(tokenExpiration)) {
      // Token expired
      store.dispatch(clearToken());
      window.location.href = '/auth/login'; // Redirect to login
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
CustomAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(clearToken());
      window.location.href = '/auth/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default CustomAxios;
