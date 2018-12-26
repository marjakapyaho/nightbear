import { configVarsInitState, ConfigVarsState } from 'web/app/modules/configVars/state';
import { pouchDbInitState, PouchDbState } from 'web/app/modules/pouchDb/state';
import { uiNavigationInitState, UiNavigationState } from 'web/app/modules/uiNavigation/state';

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
