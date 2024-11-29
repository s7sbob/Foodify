// src/store/slices/cartSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductPrice } from '../../types/product';

interface CartItem {
  productId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  total: number;
  vat: number;
  additions?: string[]; // لإضافة تفاصيل إضافية مثل "+ onions"
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  service: number;
  total: number;
  orderNumber: string; // إضافة رقم الطلب
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  vat: 0,
  service: 0,
  total: 0,
  orderNumber: 'NO16', // يمكنك توليد رقم الطلب بشكل ديناميكي إذا لزم الأمر
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.total += action.payload.total;
      } else {
        state.items.push(action.payload);
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    removeItemFromCart(state, action: PayloadAction<{ productId: string; size: string }>) {
      state.items = state.items.filter(
        item =>
          !(item.productId === action.payload.productId && item.size === action.payload.size)
      );
      cartSlice.caseReducers.calculateTotals(state);
    },
    updateItemQuantity(
      state,
      action: PayloadAction<{ productId: string; size: string; quantity: number }>
    ) {
      const item = state.items.find(
        item =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
      );
      if (item) {
        item.quantity = action.payload.quantity;
        item.total = item.price * item.quantity;
      }
      cartSlice.caseReducers.calculateTotals(state);
    },
    calculateTotals(state) {
      state.subtotal = state.items.reduce((acc, item) => acc + item.total, 0);
      // نفترض أن الخصم ثابت أو يمكن تعديله حسب الحاجة
      state.discount = 0;
      // نحسب VAT لكل عنصر بناءً على قيمة الـ VAT للمنتج
      state.vat = state.items.reduce((acc, item) => acc + (item.price * item.vat / 100) * item.quantity, 0);
      // نفترض أن الخدمة ثابتة أو يمكن تعديلها
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
      state.orderNumber = 'NO16'; // إعادة تعيين رقم الطلب إذا لزم الأمر
    },
  },
});

export const { addItemToCart, removeItemFromCart, updateItemQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
