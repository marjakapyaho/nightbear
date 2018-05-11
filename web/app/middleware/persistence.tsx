import { Middleware } from 'app/utils/redux';
import { Action } from 'app/actions';

const CONFIG_DB_URL = 'nightbear:config:dbUrl';

export const persistence: Middleware = store => {
  setTimeout(read, 0);
  return next => action => {
    write(action);
    return next(action);
  };

  function read() {
    store.dispatch({
      type: 'DB_URL_SET',
      newDbUrl: localStorage.getItem(CONFIG_DB_URL) || '',
    });
  }

  function write(action: Action) {
    if (action.type === 'DB_URL_SET') {
      localStorage.setItem(CONFIG_DB_URL, action.newDbUrl);
    }
  }
};
