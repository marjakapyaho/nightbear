import { actionsWithType } from 'web/app/utils/redux';

export const configVarsActions = actionsWithType({
  DB_URL_SET: (newDbUrl: string) => ({ newDbUrl }),
});
