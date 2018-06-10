import { ConfigVarsState } from 'web/app/modules/configVars/state';

export type ReduxState = Readonly<{
  configVars: ConfigVarsState;
}>;
