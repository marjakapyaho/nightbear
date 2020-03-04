import { actionsWithType } from 'web/utils/redux';

export const configVarsActions = actionsWithType({
  DB_URL_SET: (newDbUrl: string) => ({ newDbUrl }),
  ROLLING_ANALYSIS_TOGGLED: () => ({}),
});
