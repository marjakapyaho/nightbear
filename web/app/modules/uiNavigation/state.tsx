export type UiNavigationState = Readonly<{
  selectedScreen: 'DebugScreen' | 'BgGraphScreen' | 'DailySummaryScreen' | 'TimelineDebugScreen';
}>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'TimelineDebugScreen',
};
