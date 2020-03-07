import { configActions } from 'web/modules/config/actions';
import { pouchDbActions } from 'web/modules/pouchDb/actions';
import { timelineDataActions } from 'web/modules/timelineData/actions';
import { navigationActions } from 'web/modules/navigation/actions';
import { ActionUnionFrom } from 'web/utils/redux';

export const actions = {
  ...configActions,
  ...navigationActions,
  ...pouchDbActions,
  ...timelineDataActions,
};

// Export type describing the raw ACTION OBJECTS themselves
export type ReduxAction =
  | ActionUnionFrom<typeof configActions>
  | ActionUnionFrom<typeof navigationActions>
  | ActionUnionFrom<typeof pouchDbActions>
  | ActionUnionFrom<typeof timelineDataActions>;

// Export type describing the MAP from action type names to their corresponding creator functions
export type ReduxActions = typeof actions;
