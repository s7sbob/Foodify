// src/App.tsx

import { Suspense } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import ScrollToTop from './components/shared/ScrollToTop';
import Router from './routes/Router';
import Spinner from './views/spinner/Spinner';
import { selectActiveDir } from './selectors/customizerSelectors';

function App() {
  const routing = useRoutes(Router);
  const theme = ThemeSettings();
  const activeDir = useSelector(selectActiveDir);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={activeDir}>
        <CssBaseline />
        <ScrollToTop>
          <Suspense fallback={<Spinner />}>
            {routing}
          </Suspense>
        </ScrollToTop>
      </RTL>
    </ThemeProvider>
  );
}

export default App;
