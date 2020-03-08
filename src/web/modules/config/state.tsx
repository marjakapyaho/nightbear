export type ConfigState = Readonly<{
  remoteDbUrl: string;
  showRollingAnalysis: boolean;
  autoRefreshData: boolean;
}>;

export const configInitState: ConfigState = {
  remoteDbUrl: '',
  showRollingAnalysis: false,
  autoRefreshData: true,
};
