// src/store/slices/cartSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
  vat: number;
  additions?: string[];
  groupProducts?: {
    groupName: string;
    products: string[];
  }[];
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  service: number;
  total: number;
  orderNumber: string;
  selectedItemId: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  vat: 0,
  service: 0,
  total: 0,
  orderNumber: 'NO16',
  selectedItemId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    removeItemFromCart(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      cartSlice.caseReducers.calculateTotals(state);
    },
    updateItemQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.total = item.price * item.quantity;
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    calculateTotals(state) {
      state.subtotal = state.items.reduce((acc, item) => acc + item.total, 0);
      state.discount = 0;
      state.vat = state.items.reduce(
        (acc, item) => acc + ((item.price * item.vat) / 100) * item.quantity,
        0
      );
      state.service = 0;
      state.total = state.subtotal - state.discount + state.vat + state.service;
    },
    clearCart(state) {
      state.items = [];
      state.subtotal = 0;
      state.discount = 0;
      state.vat = 0;
      state.service = 0;
      state.total = 0;
      state.orderNumber = 'NO16';
      state.selectedItemId = null;
    },
    selectCartItem(state, action: PayloadAction<string | null>) {
      state.selectedItemId = action.payload;
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  selectCartItem,
} = cartSlice.actions;
export default cartSlice.reducer;
