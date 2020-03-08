import { actions } from 'web/modules/actions';
import { NO_OP_MIDDLEWARE, ReduxMiddleware } from 'web/utils/redux';

const AUTO_REFRESH_INTERVAL = 15 * 1000;

export const navigationMiddleware: ReduxMiddleware = store => {
  setInterval(updateTimelineRangeEnd, AUTO_REFRESH_INTERVAL);

  return NO_OP_MIDDLEWARE;

  function updateTimelineRangeEnd() {
    const state = store.getState();
    if (!state.config.autoRefreshData) return;
    if (state.navigation.selectedScreen !== 'BgGraphScreen') return;
    store.dispatch(
      actions.TIMELINE_FILTERS_CHANGED(
        state.navigation.timelineRange,
        Date.now(), // keep the same amount of data visible, but move the "viewport" to include the current time
        state.navigation.selectedModelTypes,
      ),
    );
  }
};
