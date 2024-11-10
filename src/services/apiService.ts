// src/services/apiService.ts

import axios from 'axios';

export const getCompanyData = async (baseurl: string, token: string | null) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.get(`${baseurl}/Company/GetCompanyData`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getProductGroups = async (baseurl: string, token: string | null) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.get(`${baseurl}/ProductGroups/GetAll`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getPosScreens = async (baseurl: string, token: string | null) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.get(`${baseurl}/PosScreen/GetPosScreens`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
