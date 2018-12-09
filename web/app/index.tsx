import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { middleware } from 'web/app/modules/middleware';
import { ReduxState } from 'web/app/modules/state';
import HotLoaderRoot from 'web/app/ui/utils/HotLoaderRoot';
import { configureStore } from 'web/app/utils/redux';

const store = configureStore(undefined, middleware);

render(
  <Provider store={store as Store<ReduxState>}>
    <HotLoaderRoot />
  </Provider>,
  document.getElementById('root'),
);
