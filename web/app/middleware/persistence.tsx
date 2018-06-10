import { Middleware } from 'web/app/utils/redux';

const CONFIG_DB_URL = 'nightbear:config:dbUrl';

export const persistence: Middleware = store => {
  setTimeout(read, 0);
  return next => action => {
    const oldValue = store.getState().config.remoteDbUrl;
    const result = next(action);
    const newValue = store.getState().config.remoteDbUrl;
    if (oldValue !== newValue) write(newValue);
    return result;
  };

  function read() {
    store.dispatch({
      type: 'DB_URL_SET',
      newDbUrl: localStorage.getItem(CONFIG_DB_URL) || '',
    });
  }

  function write(newDbUrl: string) {
    localStorage.setItem(CONFIG_DB_URL, newDbUrl);
  }
};
