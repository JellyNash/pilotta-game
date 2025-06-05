import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

// Import Potpie analysis tools in development
if (import.meta.env.DEV) {
  import('./analysis/quick-insights').catch(console.error);
  import('./services/potpie-examples').then(({ createPotpieDevTool }) => {
    // Enable DevTools if we have a project ID
    const projectId = localStorage.getItem('potpie_project_id');
    if (projectId) {
      createPotpieDevTool(projectId);
    }
  }).catch(console.error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
