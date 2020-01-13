import { actions } from 'web/modules/actions';
import { createChangeObserver, ReduxMiddleware } from 'web/utils/redux';

const CONFIG_DB_URL = 'nightbear:configVars:dbUrl';

export const configVarsMiddleware: ReduxMiddleware = store => {
  setTimeout(read, 0); // it's not safe to dispatch during middleware setup -> defer it to next tick

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(state => state.configVars.remoteDbUrl, write);
    return observer.run;
  };

  function read() {
    const url = localStorage.getItem(CONFIG_DB_URL) || prompt('Enter DB URL:') || '';
    store.dispatch(actions.DB_URL_SET(url));
  }

  function write(newDbUrl: string) {
    localStorage.setItem(CONFIG_DB_URL, newDbUrl);
  }
};
