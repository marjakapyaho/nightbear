import React from 'react';
import ReactDOM from 'react-dom/client';
import 'index.scss';
import App from 'frontend/App';
import 'frontend/utils/polyfills';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
