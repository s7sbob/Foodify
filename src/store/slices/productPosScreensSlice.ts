// src/store/slices/productPosScreensSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductPosScreen } from '../../types/productPosScreen';
import { getProductPosScreens } from '../../services/apiService';

interface ProductPosScreensState {
  productPosScreens: ProductPosScreen[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductPosScreensState = {
  productPosScreens: [],
  loading: false,
  error: null,
};

// Thunk لجلب جميع الفئات (PosScreens)
export const fetchProductPosScreens = createAsyncThunk<
  ProductPosScreen[],
  void,
  { rejectValue: string }
>(
  'productPosScreens/fetchProductPosScreens',
  async (_, { rejectWithValue, getState }) => {
    try {
      const baseurl = 'https://erp.ts-egy.com/api'; // تأكد من استخدام الـ baseurl الصحيح
      const state: any = getState();
      const token = state.auth.token; // تأكد من وجود التوكن في حالة الـ auth
      const productPosScreens = await getProductPosScreens(baseurl, token);
      console.log('API response - productPosScreens:', productPosScreens);
      return productPosScreens;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const productPosScreensSlice = createSlice({
  name: 'productPosScreens',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductPosScreens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductPosScreens.fulfilled, (state, action) => {
        state.loading = false;
        state.productPosScreens = action.payload;
      })
      .addCase(fetchProductPosScreens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch product pos screens';
      });
  },
});

export default productPosScreensSlice.reducer;
