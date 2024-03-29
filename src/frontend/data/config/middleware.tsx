import { actions } from 'frontend/data/actions';
import { createChangeObserver, ReduxMiddleware } from 'frontend/utils/redux';
import { ConfigState } from 'frontend/data/config/state';

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
      // If there's no DB URL set, prompt the user for the password needed to construct it
      const password = prompt('Enter password:');
      if (password) {
        store.dispatch(
          actions.CONFIG_UPDATED({
            remoteDbUrl:
              window.location.host === 'nightbear.fi'
                ? `https://nightbear:${password}@db.nightbear.fi/prod`
                : `https://nightbear:${password}@db.nightbear.fi/stage`,
          }),
        );
      }
    }
    if (!store.getState().config.nightbearApiUrl) {
      // If there's no API URL set, infer one from the hostname
      store.dispatch(
        actions.CONFIG_UPDATED({
          nightbearApiUrl:
            window.location.host === 'nightbear.fi'
              ? 'https://server.nightbear.fi/'
              : 'https://server.stage.nightbear.fi/',
        }),
      );
    }
  }

  function write(newConfig: ConfigState) {
    localStorage.setItem(LOCALSTORAGE_CONFIG_KEY, JSON.stringify(newConfig, null, 2));
  }
};
