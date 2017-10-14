import { startExpressServer } from './utils/express';

startExpressServer().then(
  // tslint:disable-next-line:no-console
  port => console.log(`Nightbear Server listening on ${port}`),
  // tslint:disable-next-line:no-console
  err => console.log(`Nightbear Server Error: ${err}`),
);
