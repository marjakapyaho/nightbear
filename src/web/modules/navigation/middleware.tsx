import { actions } from 'web/modules/actions';
import { NO_OP_MIDDLEWARE, ReduxMiddleware } from 'web/utils/redux';

const AUTO_RANGE_UPDATE_INTERVAL = 15 * 1000;

export const navigationMiddleware: ReduxMiddleware = store => {
  setInterval(updateTimelineRangeEnd, AUTO_RANGE_UPDATE_INTERVAL);

  return NO_OP_MIDDLEWARE;

  function updateTimelineRangeEnd() {
    const navigationState = store.getState().navigation;
    if (navigationState.selectedScreen === 'BgGraphScreen') {
      store.dispatch(
        actions.TIMELINE_FILTERS_CHANGED(
          navigationState.timelineRange,
          Date.now(), // keep the same amount of data visible, but move the "viewport" to include the current time
          navigationState.selectedModelTypes,
        ),
      );
    }
  }
};
