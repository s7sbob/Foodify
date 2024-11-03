// src/apps/auth/AuthSlice.tsx

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  tokenExpiration: number | null; // Unix timestamp in milliseconds
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  tokenExpiration: localStorage.getItem('tokenExpiration')
    ? Number(localStorage.getItem('tokenExpiration'))
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      const expiration = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days in ms
      state.tokenExpiration = expiration;
      localStorage.setItem('token', action.payload);
      localStorage.setItem('tokenExpiration', expiration.toString());
    },
    clearToken: (state) => {
      state.token = null;
      state.tokenExpiration = null;
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
    },
  },
});

export const { setToken, clearToken } = authSlice.actions;

export default authSlice.reducer;
