import { configVarsInitState, ConfigVarsState } from 'web/modules/configVars/state';
import { pouchDbInitState, PouchDbState } from 'web/modules/pouchDb/state';
import { uiNavigationInitState, UiNavigationState } from 'web/modules/uiNavigation/state';

export const initReduxState: ReduxState = {
  configVars: configVarsInitState,
  uiNavigation: uiNavigationInitState,
  pouchDb: pouchDbInitState,
};

export type ReduxState = Readonly<{
  configVars: ConfigVarsState;
  uiNavigation: UiNavigationState;
  pouchDb: PouchDbState;
}>;
