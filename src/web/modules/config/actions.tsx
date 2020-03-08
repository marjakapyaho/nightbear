import { ConfigState } from 'web/modules/config/state';
import { actionsWithType } from 'web/utils/redux';

export const configActions = actionsWithType({
  CONFIG_UPDATED: (newConfig: Partial<ConfigState>) => ({ newConfig }),
  ROLLING_ANALYSIS_TOGGLED: () => ({}),
  AUTO_REFRESH_TOGGLED: () => ({}),
});
