// src/routes/PrivateRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuthToken, selectAuthTokenExpiration } from '../selectors/authSelectors';
import { isTokenExpired } from '../utils/auth';
import { clearToken } from '../store/apps/auth/AuthSlice';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useSelector(selectAuthToken);
  const tokenExpiration = useSelector(selectAuthTokenExpiration);
  const location = useLocation();
  const dispatch = useDispatch();

  console.log('PrivateRoute - Token:', token);
  console.log('PrivateRoute - Token Expiration:', tokenExpiration);

  if (token) {
    console.log('PrivateRoute - Token exists:', token);
    if (isTokenExpired(tokenExpiration)) {
      console.log('PrivateRoute - Token expired');
      dispatch(clearToken());
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
    return children;
  }

  console.log('PrivateRoute - No token found');
  return <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
