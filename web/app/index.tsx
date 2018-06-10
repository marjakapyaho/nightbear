import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import HotLoaderRoot from 'web/app/ui/utils/HotLoaderRoot';
import { configureStore } from 'web/app/utils/redux';
import { Store as ReduxStore } from 'redux';
import { ReduxState } from 'web/app/modules/state';

const store = configureStore(undefined);

render(
  <Provider store={store as ReduxStore<ReduxState>}>
    <HotLoaderRoot />
  </Provider>,
  document.getElementById('root'),
);
