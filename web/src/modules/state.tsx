import { configVarsInitState, ConfigVarsState } from 'web/src/modules/configVars/state';
import { pouchDbInitState, PouchDbState } from 'web/src/modules/pouchDb/state';
import { uiNavigationInitState, UiNavigationState } from 'web/src/modules/uiNavigation/state';

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
