import { apiActions } from 'frontend/data/api/actions';
import { configActions } from 'frontend/data/config/actions';
import { dataActions } from 'frontend/data/data/actions';
import { navigationActions } from 'frontend/data/navigation/actions';
import { pouchDbActions } from 'frontend/data/pouchDb/actions';
import { ActionUnionFrom } from 'frontend/utils/redux';

export const actions = {
  ...configActions,
  ...navigationActions,
  ...pouchDbActions,
  ...apiActions,
  ...dataActions,
};

// Export type describing the raw ACTION OBJECTS themselves
export type ReduxAction =
  | ActionUnionFrom<typeof configActions>
  | ActionUnionFrom<typeof navigationActions>
  | ActionUnionFrom<typeof pouchDbActions>
  | ActionUnionFrom<typeof apiActions>
  | ActionUnionFrom<typeof dataActions>;

// Export type describing the MAP from action type names to their corresponding creator functions
export type ReduxActions = typeof actions;
