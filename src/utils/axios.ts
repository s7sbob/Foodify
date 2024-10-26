// src/utils/CustomAxios.ts

import axios from 'axios';
import { store } from '../store/Store';

const CustomAxios = axios.create({
  baseURL: 'http://erp.ts-egy.com/api',
});

CustomAxios.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default CustomAxios;
