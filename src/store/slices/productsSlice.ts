// src/store/slices/productsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Product } from '../../types/product';
import { getAllProducts } from '../../services/apiService';

interface ProductsState {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  selectedScreenId: string | null;
}

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  selectedScreenId: null,
};

export const fetchAllProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('products/fetchAllProducts', async (_, { rejectWithValue, getState }) => {
  try {
    const baseurl = 'https://erp.ts-egy.com/api'; // استخدم الـ baseurl الصحيح
    const state: any = getState();
    const token = state.auth.token; // تأكد من وجود التوكن في حالة الـ auth
    const products = await getAllProducts(baseurl, token);
    return products;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedScreenId(state, action) {
      state.selectedScreenId = action.payload;

      // تصفية المنتجات بناءً على selectedScreenId
      if (state.selectedScreenId) {
        state.filteredProducts = state.products.filter(
          (product) => product.posScreenId === state.selectedScreenId
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

        // تطبيق التصفية بناءً على selectedScreenId
        if (state.selectedScreenId) {
          state.filteredProducts = state.products.filter(
            (product) => product.posScreenId === state.selectedScreenId
          );
        } else {
          state.filteredProducts = state.products;
        }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      });
  },
});

export const { setSelectedScreenId } = productsSlice.actions;
export default productsSlice.reducer;
