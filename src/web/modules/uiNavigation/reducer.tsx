import { HOUR_IN_MS } from 'core/calculations/calculations';
import { Model } from 'core/models/model';
import { isSameModel, isTimelineModel } from 'core/models/utils';
import { reviveCouchDbRowIntoModel } from 'core/storage/couchDbStorage';
import { assertExhausted } from 'server/utils/types';
import { ReduxAction, actions } from 'web/modules/actions';
import { ReduxState } from 'web/modules/state';
import { getModelByUuid } from 'web/modules/uiNavigation/getters';
import { uiNavigationInitState, UiNavigationState } from 'web/modules/uiNavigation/state';

export function uiNavigationReducer(
  state: UiNavigationState = uiNavigationInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): UiNavigationState {
  switch (action.type) {
    case actions.UI_NAVIGATED.type:
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
            modelUuidBeingEdited: null,
            timelineCursorAt: null,
          };
        default:
          return assertExhausted(action.newScreen);
      }
    case actions.TIMELINE_FILTERS_CHANGED.type:
      const { range, rangeEnd, modelTypes } = action;
      return {
        ...state,
        selectedModelTypes: modelTypes,
        timelineRange: range,
        timelineRangeEnd: rangeEnd,
        loadedModels: { status: 'FETCHING' }, // TODO: Add token which we can check when response arrives?
      };
    case actions.TIMELINE_DATA_UPDATED.type:
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
    case actions.TIMELINE_DATA_DELETED.type:
      if (state.loadedModels.status !== 'READY') return state; // deletions while there's no data loaded should be ignored
      return {
        ...state,
        loadedModels: {
          ...state.loadedModels,
          timelineModels: removeDeletedModels(state.loadedModels.timelineModels, action.deletedModels),
          globalModels: removeDeletedModels(state.loadedModels.globalModels, action.deletedModels),
        },
      };
    case actions.TIMELINE_DATA_FAILED.type:
      return {
        ...state,
        loadedModels: { status: 'ERROR', errorMessage: action.err.message },
      };
    case actions.MODEL_SELECTED_FOR_EDITING.type:
      let modelUuidBeingEdited = null;
      if (action.model && !isSameModel(getModelByUuid(state, state.modelUuidBeingEdited), action.model)) {
        modelUuidBeingEdited = action.model.modelUuid;
      }
      return {
        ...state,
        modelUuidBeingEdited,
        timelineCursorAt: null, // clear a possible previous cursor when starting edit
      };
    case actions.TIMELINE_CURSOR_UPDATED.type:
      return {
        ...state,
        modelUuidBeingEdited: null, // clear a possible previous edit when placing cursor
        timelineCursorAt: state.modelUuidBeingEdited ? null : action.timestamp, // if we were just editing a Model, clear the cursor instead of setting it
      };
    case actions.MODEL_UPDATED_BY_USER.type:
      if (state.loadedModels.status !== 'READY') return state; // updates while there's no data loaded should be ignored
      return {
        ...state,
        modelUuidBeingEdited: action.model.modelUuid, // keep whatever we just edited selected for further edits
        timelineCursorAt: null, // clear the cursor if it existed (as it does before creating a new model)
        loadedModels: {
          ...state.loadedModels,
          timelineModels: mergeIncomingModels(state.loadedModels.timelineModels, [action.model]), // also to get a realistic re-render quicker, let's immediately merge the new Model in, even if the DB would soon emit it anyway
        },
      };
    case actions.MODEL_DELETED_BY_USER.type:
      if (state.loadedModels.status !== 'READY') return state; // deletions while there's no data loaded should be ignored
      return {
        ...state,
        modelUuidBeingEdited: null,
        timelineCursorAt: null, // clear the cursor if it existed (as it does before creating a new model)
        loadedModels: {
          ...state.loadedModels,
          timelineModels: removeDeletedModels(state.loadedModels.timelineModels, [action.model]), // also to get a realistic re-render quicker, let's immediately remove the Model, even if the DB would soon emit it anyway
        },
      };
    case actions.DB_EMITTED_CHANGES.type:
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
      map.set(m.modelUuid, m);
    });
  return [...map.values()];
}

// Updates an array of existing Models, so that the given ones are removed from it
function removeDeletedModels<T extends Model>(existingModels: T[], modelsToDelete: Model[]): T[] {
  return existingModels.filter(existingModel => !modelsToDelete.find(isSameModel.bind(null, existingModel)));
}
