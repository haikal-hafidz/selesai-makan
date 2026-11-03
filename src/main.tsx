import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Progressive Web App Service Worker for offline capability
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Selesai Makan Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}
