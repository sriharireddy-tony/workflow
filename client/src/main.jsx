import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/styles/global.scss';
import { Providers } from '@/app/providers';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import App from '@/App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Providers>
        <App />
      </Providers>
    </ErrorBoundary>
  </React.StrictMode>
);
