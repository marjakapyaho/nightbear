import { Middleware } from 'app/utils/redux';

export const logger: Middleware = store => next => action => {
  console.log('Logger Middleware', { store, next, action });
  return next(action);
};
