// src/store/slices/productsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Product } from '../../types/product';
import { AppState } from '../Store'; 

interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  selectedPosScreenId: string | null;
}

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  selectedPosScreenId: null,
};

// Thunk لجلب جميع المنتجات مع أسعارها وتعليقاتها
export const fetchAllProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string; state: AppState } // إضافة نوع الحالة هنا
>(
  'products/fetchAllProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const baseurl = 'https://erp.ts-egy.com/api'; // تأكد من استخدام الـ baseurl الصحيح
      const state = getState(); // الآن سيتم تحديد نوعه كـ AppState
      const token = state.auth.token; // تأكد من وجود التوكن في حالة الـ auth

      const response = await axios.get(`${baseurl}/Product/GetProducts`, {
        headers: { Authorization: `Bearer ${token}` }, // فقط Authorization header
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'فشل في جلب المنتجات');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedPosScreenId(state, action: PayloadAction<string | null>) {
      state.selectedPosScreenId = action.payload;

      // تصفية المنتجات بناءً على selectedPosScreenId
      if (state.selectedPosScreenId) {
        state.filteredProducts = state.products.filter(
          (product) => product.posScreenId === state.selectedPosScreenId
        );
      } else {
        state.filteredProducts = state.products;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.products = [];
        state.filteredProducts = [];
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload; // عرض جميع المنتجات مبدئيًا

        // تطبيق التصفية بناءً على selectedPosScreenId إذا كان محددًا
        if (state.selectedPosScreenId) {
          state.filteredProducts = state.products.filter(
            (product) => product.posScreenId === state.selectedPosScreenId
          );
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'فشل في جلب المنتجات';
      });
  },
});

export const { setSelectedPosScreenId } = productsSlice.actions;
export default productsSlice.reducer;
