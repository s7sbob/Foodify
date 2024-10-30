// routes/PrivateRoute.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthToken } from '../selectors/authSelectors';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useSelector(selectAuthToken);
  const location = useLocation();

  if (!token) {
    // Redirect to login page
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
