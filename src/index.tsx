import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { Store as ReduxStore } from 'redux';
import 'index.scss';
import App from 'web/ui/App';
import { createStore } from 'web/utils/redux';
import 'web/utils/polyfills';

const store = createStore();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ReduxProvider store={store as ReduxStore}>
    <App />
  </ReduxProvider>,
);
