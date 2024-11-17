// src/utils/auth.ts

export const isTokenExpired = (tokenExpiration: number | null): boolean => {
  if (!tokenExpiration) return true;
  const currentTime = Date.now();
  console.log('isTokenExpired - currentTime:', currentTime, 'tokenExpiration:', tokenExpiration);
  return currentTime > tokenExpiration;
};
