import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

export function startExpressServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.get('/', (_, res) => {
      res.status(200).json({ hello: 'world' });
    });
    const server = app.listen(3000, () => {
      resolve(server.address().port);
    });
    server.on('error', err => reject(err));
  });
}
