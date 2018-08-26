export type UiNavigationState = Readonly<{
  selectedScreen: 'DebugScreen' | 'BgGraphScreen' | 'DailySummaryScreen';
}>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'BgGraphScreen',
};
