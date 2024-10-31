// src/App.tsx

import { Suspense, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import ScrollToTop from './components/shared/ScrollToTop';
import Router from './routes/Router';
import Spinner from './views/spinner/Spinner';
import { selectActiveDir, selectLanguage } from './selectors/customizerSelectors'; // Ensure selector for language
import './utils/i18n'; // Ensure i18n is initialized
import { useTranslation } from 'react-i18next';

function App() {
  const routing = useRoutes(Router);
  const theme = ThemeSettings();
  const activeDir = useSelector(selectActiveDir) as 'rtl' | 'ltr'; // Ensure type safety
  const language = useSelector(selectLanguage); // Selector for current language
  const { i18n } = useTranslation();

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

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
