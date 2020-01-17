import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Store as ReduxStore } from 'redux';
import 'index.scss';
import * as serviceWorker from 'serviceWorker';
import App from 'web/ui/App';
import { createStore } from 'web/utils/redux';
import 'web/utils/polyfills';

const store = createStore();

ReactDOM.render(
  <ReduxProvider store={store as ReduxStore}>
    <App />
  </ReduxProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
