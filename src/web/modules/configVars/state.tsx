export type ConfigVarsState = Readonly<{
  remoteDbUrl: string;
  showRollingAnalysis: boolean;
}>;

export const configVarsInitState: ConfigVarsState = {
  remoteDbUrl: '',
  showRollingAnalysis: false,
};
