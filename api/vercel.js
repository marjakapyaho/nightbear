module.exports = (req, res) => {
  console.log('Hello from TS', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      query: req.query,
      url: req.url,
  });

  // TODO: require('shared/mocks/alarms')

  const fs = require('fs');
  const path = require('path');

  // Get the current working directory
  const currentDir = process.cwd();

  // Log the current working directory
  console.log('Current working directory:', currentDir);

  try {
      // Read the contents of the current directory
      const files = fs.readdirSync(currentDir);

      // Log the contents of the directory
      console.log('Contents of the directory:', currentDir);
      files.forEach(file => {
          console.log(file);
      });
  } catch (err) {
      console.error('Unable to scan directory:', err);
  }

  res.status(200).send(JSON.stringify({hello: 'world'}, null, 2));

};
