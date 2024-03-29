import { DAY_IN_MS, HOUR_IN_MS } from 'shared/calculations/calculations';
import { isSameModel } from 'shared/models/utils';
import { assertExhausted } from 'backend/utils/types';
import { actions, ReduxAction } from 'frontend/data/actions';
import { ReduxState } from 'frontend/data/state';
import { getModelByUuid } from 'frontend/data/data/getters';
import {
  getNavigationInitState,
  navigationInitState,
  NavigationState,
  TIMELINE_MODEL_TYPES,
} from 'frontend/data/navigation/state';

export function navigationReducer(
  state: NavigationState = navigationInitState,
  action: ReduxAction,
  rootState: ReduxState,
): NavigationState {
  switch (action.type) {
    case actions.UI_NAVIGATED.type:
      switch (action.newScreen) {
        case 'BgGraphScreen':
          return getNavigationInitState();
        case 'TimelineDebugScreen':
          return {
            ...state,
            selectedScreen: 'TimelineDebugScreen',
            selectedModelTypes: [],
            timelineRange: 12 * HOUR_IN_MS,
            timelineRangeEnd: Date.now(),
            modelUuidBeingEdited: null,
          };
        case 'StatsScreen':
          return {
            ...state,
            selectedScreen: 'StatsScreen',
            selectedModelTypes: TIMELINE_MODEL_TYPES,
            timelineRange: 7 * DAY_IN_MS,
            timelineRangeEnd: Date.now(),
          };
        case 'Config':
          return {
            selectedScreen: 'Config',
          };
        default:
          return assertExhausted(action.newScreen);
      }
    case actions.TIMELINE_FILTERS_CHANGED.type:
      if (!('selectedModelTypes' in state)) return state; // we're in a screen that doesn't contain filter config -> ignore
      const { range, rangeEnd, modelTypes } = action;
      return {
        ...state,
        selectedModelTypes: modelTypes,
        timelineRange: range,
        timelineRangeEnd: rangeEnd,
      };
    case actions.MODEL_SELECTED_FOR_EDITING.type:
      if (state.selectedScreen !== 'BgGraphScreen') return state; // not in a relevant screen -> ignore
      let modelUuidBeingEdited = null;
      if (action.model && !isSameModel(getModelByUuid(rootState.data, state.modelUuidBeingEdited), action.model)) {
        modelUuidBeingEdited = action.model.modelUuid;
      }
      return {
        ...state,
        modelUuidBeingEdited,
        timelineCursorAt: null, // clear a possible previous cursor when starting edit
      };
    case actions.TIMELINE_CURSOR_UPDATED.type:
      if (state.selectedScreen !== 'BgGraphScreen') return state; // not in a relevant screen -> ignore
      return {
        ...state,
        modelUuidBeingEdited: null, // clear a possible previous edit when placing cursor
        timelineCursorAt: state.modelUuidBeingEdited ? null : action.timestamp, // if we were just editing a Model, clear the cursor instead of setting it
      };
    case actions.MODEL_UPDATED_BY_USER.type:
      if (state.selectedScreen !== 'BgGraphScreen') return state; // not in a relevant screen -> ignore
      return {
        ...state,
        modelUuidBeingEdited: action.model.modelUuid, // keep whatever we just edited selected for further edits
        timelineCursorAt: null, // clear the cursor if it existed (as it does before creating a new model)
      };
    case actions.MODEL_DELETED_BY_USER.type:
      if (state.selectedScreen !== 'BgGraphScreen') return state; // not in a relevant screen -> ignore
      return {
        ...state,
        modelUuidBeingEdited: null,
        // timelineCursorAt: null, // clear the cursor if it existed (as it does before creating a new model)
      };
    default:
      return state;
  }
}
