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

// إضافة وظيفة لإنشاء منتج جديد
export const createProduct = async (baseurl: string, token: string | null, formData: FormData) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.post(`${baseurl}/Product/CreateProduct`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type' سيتم تحديده تلقائيًا بواسطة Axios عند استخدام FormData
    },
  });
  return response.data;
};

// إضافة وظيفة لتحديث منتج
export const updateProduct = async (baseurl: string, token: string | null, formData: FormData) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.post(`${baseurl}/Product/UpdateProduct`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type' سيتم تحديده تلقائيًا بواسطة Axios عند استخدام FormData
    },
  });
  return response.data;
};

// إضافة وظيفة لحذف منتج
export const deleteProduct = async (baseurl: string, token: string | null, productId: string) => {
  if (!token) {
    throw new Error('No authentication token provided.');
  }
  const response = await axios.delete(`${baseurl}/Product/DeleteProduct/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
