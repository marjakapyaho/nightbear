import { Cronjob } from '../utils/cronjobs';

export const temp: Cronjob = async (context, _journal) => {
  const { log } = context;
  log(`Hello from a Cronjob!`);
};
