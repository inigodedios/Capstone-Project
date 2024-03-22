import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create a root for ReactDOM
const root = ReactDOM.createRoot(document.getElementById('root'));
// Render the root with the App component wrapped in StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);