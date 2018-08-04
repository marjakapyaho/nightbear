export type ConfigVarsState = Readonly<{
  remoteDbUrl: string;
  selectedScreen: 'DebugScreen' | 'BgGraphScreen';
}>;

export const configVarsInitState: ConfigVarsState = {
  remoteDbUrl: '',
  selectedScreen: 'DebugScreen',
};
