import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import { createContext } from './utils/context';
import status from './functions/status';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/status', function(req, res) {
  const request = {
    requestId: req.get('X-Request-ID') || getUuid(), // use Heroku-style req-ID where available, but fall back to our own
    requestMethod: req.method,
    requestParams: req.query,
    requestHeaders: req.headers,
    requestBody: req.body,
  };
  status(request, createContext(process.env)).then(
    data => res.status(200).json(data),
    err => res.status(500).json({ errorMessage: `[500] Nightbear API Error (see logs for requestId ${request.requestId})` })
  );
});

const server = app.listen(3000, () => {
  console.log(`Nightbear API server listening on port ${server.address().port}`);
});

// Generates an RFC 4122 Version 4 compliant UUID
// @see http://stackoverflow.com/a/2117523
function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
