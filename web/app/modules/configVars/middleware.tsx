import { actions } from 'web/app/modules/actions';
import { createChangeObserver, ReduxMiddleware } from 'web/app/utils/redux';

const CONFIG_DB_URL = 'nightbear:configVars:dbUrl';

export const configVarsMiddleware: ReduxMiddleware = store => {
  setTimeout(read, 0);

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.configVars.remoteDbUrl, write);
    return observer.run;
  };

  function read() {
    store.dispatch(actions.DB_URL_SET(localStorage.getItem(CONFIG_DB_URL) || ''));
  }

  function write(newDbUrl: string) {
    localStorage.setItem(CONFIG_DB_URL, newDbUrl);
  }
};
