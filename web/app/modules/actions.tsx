import { ActionUnionFrom } from 'web/app/utils/redux';
import { configVarsActions } from 'web/app/modules/configVars/actions';
import { pouchDbActions } from 'web/app/modules/pouchDb/actions';
import { timelineDataActions } from 'web/app/modules/timelineData/actions';
import { uiNavigationActions } from 'web/app/modules/uiNavigation/actions';

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
