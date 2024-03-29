import { actionsWithType } from 'frontend/utils/redux';

export const apiActions = actionsWithType({
  ACK_LATEST_ALARM_STARTED: () => ({}),
  ACK_LATEST_ALARM_SUCCEEDED: () => ({}),
  ACK_LATEST_ALARM_FAILED: (err: Error) => ({ err }),
});
