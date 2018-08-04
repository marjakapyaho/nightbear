export type ConfigVarsState = Readonly<{
  remoteDbUrl: string;
  selectedScreen: 'DebugScreen';
}>;

export const configVarsInitState: ConfigVarsState = {
  remoteDbUrl: '',
  selectedScreen: 'DebugScreen',
};
