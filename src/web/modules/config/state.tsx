export type ConfigState = Readonly<{
  remoteDbUrl: string;
  showRollingAnalysis: boolean;
}>;

export const configInitState: ConfigState = {
  remoteDbUrl: '',
  showRollingAnalysis: false,
};
