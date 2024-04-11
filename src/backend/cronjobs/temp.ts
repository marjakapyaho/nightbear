import { Cronjob } from 'backend/utils/cronjobs';

export const temp: Cronjob = async (context, journal) => {
  const { log } = context;
  log(`Hello from a Cronjob!`);
};
