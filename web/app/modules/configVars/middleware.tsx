import { Middleware } from 'web/app/utils/redux';
import { actions } from 'web/app/modules/actions';

const CONFIG_DB_URL = 'nightbear:configVars:dbUrl';

export const configVarsMiddleware: Middleware = store => {
  setTimeout(read, 0);
  return next => action => {
    const oldValue = store.getState().configVars.remoteDbUrl;
    const result = next(action);
    const newValue = store.getState().configVars.remoteDbUrl;
    if (oldValue !== newValue) write(newValue);
    return result;
  };

  function read() {
    store.dispatch(actions.DB_URL_SET(localStorage.getItem(CONFIG_DB_URL) || ''));
  }

  function write(newDbUrl: string) {
    localStorage.setItem(CONFIG_DB_URL, newDbUrl);
  }
};
