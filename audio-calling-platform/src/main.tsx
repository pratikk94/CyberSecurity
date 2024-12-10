/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import process from 'process';

if (!window.global) {
  (window as any).global = window;
}
(window as any).process = process;
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);