import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Model } from 'core/models/model';
import { isTimelineModel, isSameModel } from 'core/models/utils';
import { getStorageKey, reviveCouchDbRowIntoModel } from 'core/storage/couchDbStorage';
import { assertExhausted } from 'server/utils/types';
import { ReduxAction } from 'web/modules/actions';
import { ReduxState } from 'web/modules/state';
import { uiNavigationInitState, UiNavigationState } from 'web/modules/uiNavigation/state';

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
      const { range, rangeEnd, modelTypes } = action;
      return {
        ...state,
        selectedModelTypes: modelTypes,
        timelineRange: range,
        timelineRangeEnd: rangeEnd,
        loadedModels: { status: 'FETCHING' }, // TODO: Add token which we can check when response arrives?
      };
    case 'TIMELINE_DATA_RECEIVED':
      const timelineModels = mergeIncomingModels(
        state.loadedModels.status === 'READY' ? state.loadedModels.timelineModels : [],
        action.timelineModels,
      );
      const globalModels = mergeIncomingModels(
        state.loadedModels.status === 'READY' ? state.loadedModels.globalModels : [],
        action.globalModels,
      );
      return {
        ...state,
        loadedModels: { status: 'READY', timelineModels, globalModels },
      };
    case 'TIMELINE_DATA_FAILED':
      return {
        ...state,
        loadedModels: { status: 'ERROR', errorMessage: action.err.message },
      };
    case 'MODEL_SELECTED_FOR_EDITING':
      return {
        ...state,
        modelBeingEdited: isSameModel(state.modelBeingEdited, action.model) ? null : action.model, // if selecting the same model again, de-select instead
        timelineCursorAt: null, // clear a possible previous cursor when starting edit
      };
    case 'TIMELINE_CURSOR_UPDATED':
      return {
        ...state,
        modelBeingEdited: null, // clear a possible previous edit when placing cursor
        timelineCursorAt: state.modelBeingEdited ? null : action.timestamp, // if we were just editing a Model, clear the cursor instead of setting it
      };
    case 'MODEL_UPDATED_BY_USER':
      return {
        ...state,
        modelBeingEdited: null, // after updating a model, de-select it
        timelineCursorAt: null, // ^ ditto for the cursor, if it existed (as it does before creating a new model)
      };
    case 'DB_EMITTED_CHANGES':
      if (state.loadedModels.status !== 'READY') return state;
      try {
        const newModels = action.changes.map(change => reviveCouchDbRowIntoModel(change.doc));
        console.log('Got new models', newModels);
        return {
          ...state,
          loadedModels: {
            ...state.loadedModels,
            timelineModels: state.loadedModels.timelineModels.map(existingModel => {
              const replacement = newModels.find(isSameModel.bind(null, existingModel));
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

// Updates an array of existing Models, so that incoming Models either replace existing ones with the same storageKey, or are simply appended if they're new
function mergeIncomingModels<T extends Model>(existingModels: T[], incomingModels: T[]): T[] {
  const map = new Map<string, T>();
  ([] as T[])
    .concat(existingModels)
    .concat(incomingModels)
    .forEach(m => {
      map.set(getStorageKey(m), m);
    });
  return [...map.values()];
}
