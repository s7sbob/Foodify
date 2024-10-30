// src/index.tsx

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter

import App from './App';
import { store } from './store/Store';
import Spinner from './views/spinner/Spinner';
import { NotificationProvider } from './context/NotificationContext';
import './utils/i18n';
import './_mockApis';

ReactDOM.createRoot(document.getElementById('root')!).render(

  <React.StrictMode>
    <Provider store={store}>
      <NotificationProvider>
        <Suspense fallback={<Spinner />}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </Suspense>
      </NotificationProvider>
    </Provider>
  </React.StrictMode>,
);
