export type ConfigState = Readonly<{
  nightbearApiUrl: string;
  remoteDbUrl: string;
  showRollingAnalysis: boolean;
  autoRefreshData: boolean;
  zoomedInTimeline: boolean;
  timelineResetTimeout: number;
}>;

export const configInitState: ConfigState = {
  nightbearApiUrl: '',
  remoteDbUrl: '',
  showRollingAnalysis: false,
  autoRefreshData: true,
  zoomedInTimeline: false,
  timelineResetTimeout: 1000 * 30,
};
