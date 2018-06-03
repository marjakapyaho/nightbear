import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import HotLoaderRoot from 'nightbear/web/app/ui/utils/HotLoaderRoot';
import { configureStore } from 'nightbear/web/app/utils/redux';
import { defaultState, State } from 'nightbear/web/app/reducers';
import defaultMiddleware from 'nightbear/web/app/middleware';
import { Store as ReduxStore } from 'redux';

const store = configureStore(defaultState, defaultMiddleware);

render(
  <Provider store={store as ReduxStore<State>}>
    <HotLoaderRoot />
  </Provider>,
  document.getElementById('root'),
);
