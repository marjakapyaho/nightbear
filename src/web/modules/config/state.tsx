export type ConfigState = Readonly<{
  nightbearApiUrl: string;
  remoteDbUrl: string;
  showRollingAnalysis: boolean;
  autoRefreshData: boolean;
  zoomedInTimeline: boolean;
}>;

export const configInitState: ConfigState = {
  nightbearApiUrl: '',
  remoteDbUrl: '',
  showRollingAnalysis: false,
  autoRefreshData: true,
  zoomedInTimeline: false,
};
