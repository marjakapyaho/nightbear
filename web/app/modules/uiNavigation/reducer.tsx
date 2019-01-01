import { HOUR_IN_MS } from 'core/calculations/calculations';
import { isTimelineModel } from 'core/models/utils';
import { getStorageKey, reviveCouchDbRowIntoModel } from 'core/storage/couchDbStorage';
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
            modelBeingEdited: null,
            timelineCursorAt: null,
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
      const { timelineModels, globalModels } = action;
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return {
        ...state,
        loadedModels: { status: 'READY', timelineModels, globalModels },
      };
    case 'TIMELINE_DATA_FAILED':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return {
        ...state,
        loadedModels: { status: 'ERROR', errorMessage: action.err.message },
      };
    case 'MODEL_SELECTED_FOR_EDITING':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return { ...state, modelBeingEdited: action.model };
    case 'TIMELINE_CURSOR_UPDATED':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      return { ...state, timelineCursorAt: action.timestamp };
    case 'DB_EMITTED_CHANGES':
      if (state.selectedScreen !== 'TimelineDebugScreen') return state;
      if (state.loadedModels.status !== 'READY') return state;
      try {
        const newModels = action.changes.map(change => reviveCouchDbRowIntoModel(change.doc));
        console.log('Got new models', newModels);
        return {
          ...state,
          loadedModels: {
            ...state.loadedModels,
            timelineModels: state.loadedModels.timelineModels.map(existingModel => {
              const replacement = newModels.find(
                newModel => getStorageKey(newModel) === getStorageKey(existingModel),
              );
              if (replacement && isTimelineModel(replacement)) {
                console.log('Found replacement:', replacement);
                return replacement;
              } else {
                return existingModel;
              }
            }),
          },
        };
      } catch (err) {
        console.log(`Couldn't revive changed docs into models`, action.changes);
      }
      return state;
    default:
      return state;
  }
}
