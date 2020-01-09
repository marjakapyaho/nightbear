import { configVarsActions } from 'web/modules/configVars/actions';
import { pouchDbActions } from 'web/modules/pouchDb/actions';
import { timelineDataActions } from 'web/modules/timelineData/actions';
import { uiNavigationActions } from 'web/modules/uiNavigation/actions';
import { ActionUnionFrom } from 'web/utils/redux';

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
