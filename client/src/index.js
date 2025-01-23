import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import router from './routes/index';
import { Provider } from 'react-redux';
import { store } from './redux/store';

// Polyfill imports MUST come first
import { Buffer } from 'buffer';
import process from 'process';

// Set globals immediately after polyfill imports
window.Buffer = Buffer;
window.process = process;

const root = ReactDOM.createRoot(document.getElementById('root'));
// Add a temporary test component
root.render(
  <React.StrictMode>
    <h1 style={{color: 'red'}}>TEST RENDER - CHECK IF THIS APPEARS</h1>
    <Provider store={store}>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();