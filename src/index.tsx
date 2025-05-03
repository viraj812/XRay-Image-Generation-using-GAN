import React from 'react';
import ReactDOM from 'react-dom/client';
import './app/globals.css';
import Home from './app/page';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
); 