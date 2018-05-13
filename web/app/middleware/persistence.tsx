import { Middleware } from 'app/utils/redux';

const CONFIG_DB_URL = 'nightbear:config:dbUrl';

export const persistence: Middleware = store => {
  setTimeout(read, 0);
  return next => action => {
    const preValue = store.getState().config.dbUrl;
    const result = next(action);
    const postValue = store.getState().config.dbUrl;
    if (preValue !== postValue) write(postValue);
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
