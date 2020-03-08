import { actions } from 'web/modules/actions';
import { createChangeObserver, ReduxMiddleware } from 'web/utils/redux';
import { ConfigState } from 'web/modules/config/state';

const LOCALSTORAGE_CONFIG_KEY = 'nightbear:config';

export const configMiddleware: ReduxMiddleware = store => {
  setTimeout(read, 0); // it's not safe to dispatch during middleware setup -> defer it to next tick

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.config, write);
    return observer.run;
  };

  function read() {
    const prevConfig = JSON.parse(localStorage.getItem(LOCALSTORAGE_CONFIG_KEY) || '{}');
    store.dispatch(actions.CONFIG_UPDATED(prevConfig));
    if (!store.getState().config.remoteDbUrl) {
      // If there's no DB URL set, prompt the user for it, otherwise the app is kinda useless
      store.dispatch(actions.CONFIG_UPDATED({ remoteDbUrl: prompt('Enter DB URL:') || '' }));
    }
  }

  function write(newConfig: ConfigState) {
    localStorage.setItem(LOCALSTORAGE_CONFIG_KEY, JSON.stringify(newConfig, null, 2));
  }
};
