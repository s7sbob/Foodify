// src/store/slices/productPricesSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductPrice } from '../../types/product';
import axios from 'axios';

interface ProductPricesState {
  prices: ProductPrice[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductPricesState = {
  prices: [],
  loading: false,
  error: null,
};

// Thunk لجلب أسعار المنتج
export const fetchAllProductPrices = createAsyncThunk<
  ProductPrice[],
  string, // productId
  { rejectValue: string }
>('productPrices/fetchAllProductPrices', async (productId, { rejectWithValue, getState }) => {
  try {
    const baseurl = 'https://erp.ts-egy.com/api'; // استخدم الـ baseurl الصحيح
    const state: any = getState();
    const token = state.auth.token; // تأكد من وجود التوكن
    const response = await axios.get(`${baseurl}/Product/GetAllProductPrices`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { productId }, // افترض أن الـ API يقبل الـ productId كـ Query Parameter
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const productPricesSlice = createSlice({
  name: 'productPrices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProductPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.prices = [];
      })
      .addCase(fetchAllProductPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = action.payload;
      })
      .addCase(fetchAllProductPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product prices';
      });
  },
});

export default productPricesSlice.reducer;
