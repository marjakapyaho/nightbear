import { startExpressServer } from './utils/express';
import { createConsoleLogger } from './utils/logging';

const log = createConsoleLogger();

startExpressServer().then(
  port => log.info(`Nightbear Server listening on ${port}`),
  err => log.error(`Nightbear Server Error: ${err.message}`, err),
);
