import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { timelineDataInitState, TimelineDataState } from 'web/app/modules/timelineData/state';
import { reviveCouchDbRowIntoModel } from 'core/storage/couchDbStorage';
import { isTimelineModel } from 'core/models/model';

export function timelineDataReducer(
  state: TimelineDataState = timelineDataInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): TimelineDataState {
  switch (action.type) {
    case 'DB_EMITTED_CHANGE':
      const newModel = reviveCouchDbRowIntoModel(action.change.doc);
      if (!isTimelineModel(newModel) || !state.filters.modelTypes.includes(newModel.modelType)) {
        return state; // doesn't match our filters
      }
      // TODO: updateDbState(state, 'LOCAL', 'ACTIVE')..?
      if (state.status !== 'READY') {
        return state; // we're in the middle of a fetch -> ignore the change
      }
      return {
        ...state,
        filters: { ...state.filters, rangeEnd: Date.now() },
        models: [newModel, ...state.models],
      };
    case 'TIMELINE_FILTERS_CHANGED':
      const { range, rangeEnd, modelTypes } = action;
      return {
        status: 'FETCHING',
        filters: { range, rangeEnd, modelTypes },
      };
    case 'TIMELINE_DATA_RECEIVED':
      const { models } = action;
      return {
        status: 'READY',
        filters: state.filters,
        models,
      };
    case 'TIMELINE_DATA_FAILED':
      return {
        status: 'ERROR',
        filters: state.filters,
        errorMessage: action.err.message,
      };
    default:
      return state;
  }
}
