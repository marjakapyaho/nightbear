import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import HotLoaderRoot from 'app/ui/utils/HotLoaderRoot';
import { configureStore } from 'app/utils/redux';
import { logger } from 'app/middleware/logger';
import { defaultState } from 'app/reducers';

const store = configureStore(defaultState, [logger]);

render(
  <Provider store={store}>
    <HotLoaderRoot />
  </Provider>,
  document.getElementById('root'),
);
