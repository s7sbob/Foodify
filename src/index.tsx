// src/index.tsx

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { store } from './store/Store';
import Spinner from './views/spinner/Spinner';
import { NotificationProvider } from './context/NotificationContext'; // Ensure correct path
import './utils/i18n';
import './_mockApis';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationProvider> {/* Wrap with NotificationProvider */}
        <Suspense fallback={<Spinner />}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Suspense>
      </NotificationProvider>
    </Provider>
  </React.StrictMode>,
);
