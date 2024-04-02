import { Cronjob } from 'backend/main/cronjobs';

export const helloWorld: Cronjob = async (context, journal) => {
  const { log } = context;
  log(`Hello from a Cronjob!`);
};
