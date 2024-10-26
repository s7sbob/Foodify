// src/store.tsx

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
import authReducer from './apps/auth/AuthSlice'; // Authentication slice

import { setupInterceptors } from '../axiosConfig'; // Import the setup function for Axios interceptors

// Combine all reducers
const rootReducer = combineReducers({
  customizer: customizerReducer,
  ecommerce: ecommerceReducer,
  tickets: ticketReducer,
  userProfile: userProfileReducer,
  auth: authReducer, // Auth reducer for managing token
});

// Configure the store with reducers
export const store = configureStore({
  reducer: rootReducer,
});

// Set up the Axios interceptors after the store is created
setupInterceptors(store);

// TypeScript types for state and dispatch
export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks to use dispatch and selector with types
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

// Optional: You can export dispatch separately if needed
export const { dispatch } = store;

export default store;
