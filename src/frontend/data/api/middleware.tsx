import axios from 'axios';
import { actions, ReduxAction } from 'frontend/data/actions';
import { getNightbearApiUrl } from 'frontend/data/config/getters';
import { ReduxMiddleware } from 'frontend/utils/redux';

export const apiMiddleware: ReduxMiddleware = store => {
  return next => {
    return (action: ReduxAction) => {
      if (action.type === actions.ACK_LATEST_ALARM_STARTED.type) {
        Promise.resolve()
          .then(() => axios.post(getNightbearApiUrl(store.getState().config, 'ack-latest-alarm')))
          .then(
            () => store.dispatch(actions.ACK_LATEST_ALARM_SUCCEEDED()),
            err => store.dispatch(actions.ACK_LATEST_ALARM_FAILED(err)),
          );
      }
      if (action.type === actions.ACK_LATEST_ALARM_FAILED.type) {
        alert(`Couldn't ack latest alarm: ${action.err}`);
      }
      return next(action); // run reducers normally
    };
  };
};
