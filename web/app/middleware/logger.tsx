import { Middleware } from 'app/utils/redux';

export const logger: Middleware = _ => next => action => {
  console.log('Action dispatched:', action);
  return next(action);
};
