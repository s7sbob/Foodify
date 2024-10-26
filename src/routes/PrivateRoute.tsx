import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../store/Store'; 

const PrivateRoute = () => {
  // Try to get token from localStorage or sessionStorage
  const token = useSelector((state: AppState) => state.auth.token) || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
