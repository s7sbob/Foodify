// src/utils/auth.ts

export const isTokenExpired = (expiration: number | null): boolean => {
    if (!expiration) return true;
    return Date.now() > expiration;
  };
  