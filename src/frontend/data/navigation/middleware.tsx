import { debounce } from 'lodash';
import { actions } from 'frontend/data/actions';
import { getModelByUuid } from 'frontend/data/data/getters';
import { createChangeObserver, ReduxMiddleware } from 'frontend/utils/redux';

const AUTO_REFRESH_INTERVAL = 15 * 1000;

export const navigationMiddleware: ReduxMiddleware = store => {
  setInterval(updateTimelineRangeEnd, AUTO_REFRESH_INTERVAL);

  return next => {
    const observer = createChangeObserver(store, next);
    observer.add(
      ({ navigation, data }) => {
        if (navigation.selectedScreen !== 'BgGraph') return undefined;
        return [
          navigation.timelineCursorAt, // cursor position changes reset the timer
          getModelByUuid(data, navigation.modelUuidBeingEdited), // changes in model being edited reset the timer
        ];
      },
      debounce(() => {
        store.dispatch(actions.TIMELINE_CURSOR_UPDATED(null));
        store.dispatch(actions.MODEL_SELECTED_FOR_EDITING(null));
      }, store.getState().config.timelineResetTimeout),
    );
    return observer.run;
  };

  function updateTimelineRangeEnd() {
    const state = store.getState();
    if (!state.config.autoRefreshData) return;
    if (state.navigation.selectedScreen !== 'BgGraph') return;
    store.dispatch(
      actions.TIMELINE_FILTERS_CHANGED(
        state.navigation.timelineRange,
        Date.now(), // keep the same amount of data visible, but move the "viewport" to include the current time
        state.navigation.selectedModelTypes,
      ),
    );
  }
};
