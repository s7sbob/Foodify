// src/store/store.tsx

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import customizerReducer from './customizer/CustomizerSlice';
import ecommerceReducer from './apps/eCommerce/ECommerceSlice';
import ticketReducer from './apps/tickets/TicketSlice';
import userProfileReducer from './apps/userProfile/UserProfileSlice';
import authReducer from './apps/auth/AuthSlice'; // Slice الخاص بالمصادقة
import productPosScreensReducer from './slices/productPosScreensSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import { setupInterceptors } from '../axiosConfig'; // استيراد إعدادات Axios

// دمج جميع الـ reducers
const rootReducer = combineReducers({
  customizer: customizerReducer,
  ecommerce: ecommerceReducer,
  tickets: ticketReducer,
  userProfile: userProfileReducer,
  auth: authReducer, // Auth reducer لإدارة التوكن
  productPosScreens: productPosScreensReducer,
  products: productsReducer,
  cart: cartReducer,
});

// تكوين الـ store
export const store = configureStore({
  reducer: rootReducer,
});

// إعداد اعتراضات Axios بعد إنشاء الـ store
setupInterceptors(store);

// أنواع TypeScript للحالة والـ dispatch
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// هوكس مخصصة لاستخدام dispatch و selector مع الأنواع
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

// تصدير dispatch بشكل اختياري إذا لزم الأمر
export const { dispatch } = store;

export default store;
