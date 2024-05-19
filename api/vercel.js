module.exports = (req, res) => {
  console.log('Hello from TS', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
      url: req.url,
  });
  res.status(200).send(JSON.stringify(require('shared/mocks/alarms'), null, 2));
};
