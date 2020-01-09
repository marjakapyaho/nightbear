import { configVarsActions } from 'web/src/modules/configVars/actions';
import { pouchDbActions } from 'web/src/modules/pouchDb/actions';
import { timelineDataActions } from 'web/src/modules/timelineData/actions';
import { uiNavigationActions } from 'web/src/modules/uiNavigation/actions';
import { ActionUnionFrom } from 'web/src/utils/redux';

export const actions = {
  ...configVarsActions,
  ...uiNavigationActions,
  ...pouchDbActions,
  ...timelineDataActions,
};

export type ReduxAction =
  | ActionUnionFrom<typeof configVarsActions>
  | ActionUnionFrom<typeof uiNavigationActions>
  | ActionUnionFrom<typeof pouchDbActions>
  | ActionUnionFrom<typeof timelineDataActions>;
