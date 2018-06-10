import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { pouchDbInitState, PouchDbState } from 'web/app/modules/pouchDb/state';

export function pouchDbReducer(
  state = pouchDbInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): PouchDbState {
  switch (action.type) {
    // TODO
    default:
      return state;
  }
}
