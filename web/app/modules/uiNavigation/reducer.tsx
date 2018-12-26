import { HOUR_IN_MS } from 'core/calculations/calculations';
import { assertExhausted } from 'server/utils/types';
import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { uiNavigationInitState, UiNavigationState } from 'web/app/modules/uiNavigation/state';

export function uiNavigationReducer(
  state: UiNavigationState = uiNavigationInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): UiNavigationState {
  switch (action.type) {
    case 'UI_NAVIGATED':
      switch (action.newScreen) {
        case 'BgGraphScreen':
          return { ...state, selectedScreen: 'BgGraphScreen' };
        case 'TimelineDebugScreen':
          return {
            ...state,
            selectedScreen: 'TimelineDebugScreen',
            selectedModelTypes: [],
            loadedModels: { status: 'FETCHING' },
            timelineRange: 12 * HOUR_IN_MS,
            timelineRangeEnd: Date.now(),
          };
        default:
          return assertExhausted(action.newScreen);
      }
    case 'TIMELINE_FILTERS_CHANGED':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      const { range, rangeEnd, modelTypes } = action;
      return {
        ...state,
        selectedModelTypes: modelTypes,
        timelineRange: range,
        timelineRangeEnd: rangeEnd,
        loadedModels: { status: 'FETCHING' }, // TODO: Add token which we can check when response arrives?
      };
    case 'TIMELINE_DATA_RECEIVED':
      const { models } = action;
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return {
        ...state,
        loadedModels: { status: 'READY', models },
      };
    case 'TIMELINE_DATA_FAILED':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return {
        ...state,
        loadedModels: { status: 'ERROR', errorMessage: action.err.message },
      };
    default:
      return state;
  }
}
