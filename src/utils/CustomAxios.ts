// src/utils/CustomAxios.ts

import axios from 'axios';
import { store } from '../store/Store'; // تأكد من المسار الصحيح
import { clearToken } from '../store/apps/auth/AuthSlice';
import { isTokenExpired } from './auth';

// إنشاء نسخة من Axios
const CustomAxios = axios.create({
  baseURL: 'https://erp.ts-egy.com/api',
});

// اعتراض الطلبات
CustomAxios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    const tokenExpiration = state.auth.tokenExpiration;

    console.log('Axios Interceptor - Token:', token);
    console.log('Axios Interceptor - Token Expiration:', tokenExpiration);

    if (token && !isTokenExpired(tokenExpiration)) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
      console.log('Axios Interceptor - Authorization header set');
    } else if (token && isTokenExpired(tokenExpiration)) {
      console.log('Axios Interceptor - Token expired, clearing token');
      store.dispatch(clearToken());
      window.location.href = '/auth/login';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// اعتراض الردود
CustomAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Axios Interceptor - 401 Unauthorized, clearing token');
      store.dispatch(clearToken());
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default CustomAxios;
