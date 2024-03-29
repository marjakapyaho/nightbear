import { ConfigState } from 'frontend/data/config/state';
import { actionsWithType } from 'frontend/utils/redux';

export const configActions = actionsWithType({
  CONFIG_UPDATED: (newConfig: Partial<ConfigState>) => ({ newConfig }),
  ROLLING_ANALYSIS_TOGGLED: () => ({}),
  AUTO_REFRESH_TOGGLED: () => ({}),
  ZOOMED_IN_TIMELINE_TOGGLED: () => ({}),
});
