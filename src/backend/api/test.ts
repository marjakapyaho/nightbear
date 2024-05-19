// TOOD: import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = (req: any, res: any) => {
  const { name = 'World' } = req.query;
  console.log('Hello from TS', {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
    url: req.url,
  })
  res.status(200).send(`Hello, ${name}!`);
};
