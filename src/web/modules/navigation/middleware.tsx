import { actions } from 'web/modules/actions';
import { createChangeObserver, ReduxMiddleware } from 'web/utils/redux';

const AUTO_REFRESH_INTERVAL = 15 * 1000;

export const navigationMiddleware: ReduxMiddleware = store => {
  setInterval(updateTimelineRangeEnd, AUTO_REFRESH_INTERVAL);
  let timelineCursorReset: NodeJS.Timeout | undefined;

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(
      state => (state.navigation.selectedScreen === 'BgGraphScreen' && state.navigation.timelineCursorAt) || undefined,
      timelineCursorMoved,
    );
    return observer.run;
  };

  function timelineCursorMoved(newCursorAt?: number) {
    if (timelineCursorReset) clearTimeout(timelineCursorReset);
    if (newCursorAt) {
      timelineCursorReset = setTimeout(() => {
        store.dispatch(actions.TIMELINE_CURSOR_UPDATED(null));
      }, store.getState().config.timelineResetTimeout);
    }
  }

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
