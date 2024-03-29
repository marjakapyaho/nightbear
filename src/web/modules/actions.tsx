import { apiActions } from 'web/modules/api/actions';
import { configActions } from 'web/modules/config/actions';
import { dataActions } from 'web/modules/data/actions';
import { navigationActions } from 'web/modules/navigation/actions';
import { pouchDbActions } from 'web/modules/pouchDb/actions';
import { ActionUnionFrom } from 'web/utils/redux';

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
