import { actionsWithType } from 'web/src/utils/redux';

export const configVarsActions = actionsWithType({
  DB_URL_SET: (newDbUrl: string) => ({ newDbUrl }),
});
