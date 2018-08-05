export type UiNavigationState = Readonly<{
  selectedScreen: 'DebugScreen' | 'BgGraphScreen';
}>;

export const uiNavigationInitState: UiNavigationState = {
  selectedScreen: 'DebugScreen',
};
