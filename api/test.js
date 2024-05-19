module.exports = (req, res) => {
  const { name = 'World' } = req.query;
  console.log('Incoming request', req)
  res.status(200).send(`Hello, ${name}!`);
};
