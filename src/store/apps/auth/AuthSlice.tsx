// src/store/apps/auth/AuthSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  tokenExpiration: number | null;
}

const getInitialState = (): AuthState => ({
  token: sessionStorage.getItem('token') || null,
  tokenExpiration: sessionStorage.getItem('tokenExpiration') ? Number(sessionStorage.getItem('tokenExpiration')) : null,
});

const initialState: AuthState = getInitialState();

const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string; tokenExpiration: number }>) => {
      state.token = action.payload.token;
      state.tokenExpiration = action.payload.tokenExpiration;
      sessionStorage.setItem('token', action.payload.token);
      sessionStorage.setItem('tokenExpiration', action.payload.tokenExpiration.toString());
      console.log('Token set:', action.payload.token, 'Token Expiration:', action.payload.tokenExpiration);
    },
    clearToken: (state) => {
      state.token = null;
      state.tokenExpiration = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenExpiration');
      console.log('Token cleared');
    },
  },
});

export const { setToken, clearToken } = AuthSlice.actions;
export default AuthSlice.reducer;
