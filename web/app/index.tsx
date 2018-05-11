import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import HotLoaderRoot from 'app/ui/utils/HotLoaderRoot';
import { configureStore } from 'app/utils/redux';
import { defaultState, State } from 'app/reducers';
import defaultMiddleware from 'app/middleware';
import { Store as ReduxStore } from 'redux';

const store = configureStore(defaultState, defaultMiddleware);

render(
  <Provider store={store as ReduxStore<State>}>
    <HotLoaderRoot />
  </Provider>,
  document.getElementById('root'),
);
