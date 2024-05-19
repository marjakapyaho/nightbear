import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function (request: VercelRequest, response: VercelResponse) {
  const { name = 'World' } = request.query;
  console.log('Hello from TS!', {
    body: request.body,
    headers: request.headers,
    method: request.method,
    query: request.query,
    url: request.url,
  })
  response.send(`Hello ${name}!`);
}
