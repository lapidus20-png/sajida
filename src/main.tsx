import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx loaded');

try {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  console.log('React root created');

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log('App rendered');

  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
} catch (error) {
  console.error('Failed to start app:', error);
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.innerHTML =
      '<div class="content">' +
      '<h2 style="color: #dc2626;">Erreur critique</h2>' +
      '<p style="color: #991b1b; font-size: 0.875rem;">' + error + '</p>' +
      '<button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Recharger</button>' +
      '</div>';
  }
}
