// src/App.tsx

import { Suspense, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import ScrollToTop from './components/shared/ScrollToTop';
import Router from './routes/Router';
import Spinner from './views/spinner/Spinner';
import { selectActiveDir, selectLanguage } from './selectors/customizerSelectors';
import './utils/i18n';
import { useTranslation } from 'react-i18next';
import { isTokenExpired } from './utils/auth';
import { clearToken } from './store/apps/auth/AuthSlice';
import { AppState } from './store/Store';
import { selectAuthToken, selectAuthTokenExpiration } from './selectors/authSelectors';
import { useLocation } from 'react-router-dom';

function App() {
  const routing = useRoutes(Router);
  const theme = ThemeSettings();
  const activeDir = useSelector(selectActiveDir) as 'rtl' | 'ltr';
  const language = useSelector(selectLanguage);
  const token = useSelector(selectAuthToken);
  const tokenExpiration = useSelector(selectAuthTokenExpiration);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { i18n } = useTranslation();

  // Handle language changes
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Check token expiration on app load and token change
  useEffect(() => {
    if (token && isTokenExpired(tokenExpiration)) {
      dispatch(clearToken());
      navigate('/auth/login', { replace: true, state: { from: location } });
    }
  }, [token, tokenExpiration, dispatch, navigate, location]);

  // Set a timeout to automatically log out when the token expires
  useEffect(() => {
    if (token && tokenExpiration) {
      const timeout = tokenExpiration - Date.now();
      if (timeout > 0) {
        const timer = setTimeout(() => {
          dispatch(clearToken());
          navigate('/auth/login', { replace: true });
        }, timeout);
        return () => clearTimeout(timer);
      } else {
        dispatch(clearToken());
        navigate('/auth/login', { replace: true });
      }
    }
  }, [token, tokenExpiration, dispatch, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={activeDir}>
        <CssBaseline />
        <ScrollToTop>
          <Suspense fallback={<Spinner />}>{routing}</Suspense>
        </ScrollToTop>
      </RTL>
    </ThemeProvider>
  );
}

export default App;
