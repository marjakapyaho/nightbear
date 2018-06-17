import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { timelineDataInitState, TimelineDataState } from 'web/app/modules/timelineData/state';

export function timelineDataReducer(
  state: TimelineDataState = timelineDataInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): TimelineDataState {
  switch (action.type) {
    case 'DB_EMITTED_CHANGES':
      if (state.status !== 'READY') return state; // we're in the middle of a fetch -> ignore the change
      // Because we have a change observer on the filters, which will re-fetch the range whenever the filters change,
      // and because fetches from the local DB are cheap, we just react by updating the filters (and discard the models)
      // because the fetch that will be triggered will retrieve everything it needs to from the DB.
      return {
        ...state,
        filters: { ...state.filters, rangeEnd: Date.now() },
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
