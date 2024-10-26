// src/hooks/useAuth.ts

import { useSelector } from 'react-redux';
import { AppState } from '../store/Store';

const useAuth = () => {
  const token = useSelector((state: AppState) => state.auth.token);
  const isRehydrated = useSelector((state: AppState) => state);

  return { token, isRehydrated };
};

export default useAuth;
