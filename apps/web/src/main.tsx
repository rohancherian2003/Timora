import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Auto-recover from deployment chunk mismatches (Vite preload errors & dynamic module fetch failures)
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const triggerAutoReload = (reason: string) => {
    console.warn(`[Timora] ${reason}: auto-reloading to fetch fresh application build...`);
    const lastPreloadReload = sessionStorage.getItem('timora_last_preload_reload');
    const now = Date.now();
    if (!lastPreloadReload || now - Number(lastPreloadReload) > 5000) {
      sessionStorage.setItem('timora_last_preload_reload', String(now));
      window.location.reload();
    }
  };

  window.addEventListener('vite:preloadError', (event) => {
    triggerAutoReload('Vite preload error (new deployment detected)');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = event?.reason?.message || String(event?.reason || '');
    if (
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Expected a JavaScript-or-Wasm module script') ||
      errorMsg.includes('Strict MIME type checking is enforced')
    ) {
      event.preventDefault();
      triggerAutoReload('Dynamic import chunk mismatch');
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
