// TODO: import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = (req: any, res: any) => {
  const fs = require('fs');

  // Get the current working directory
  const currentDir = process.cwd() + 'src';

  // Log the current working directory
  console.log('Current working directory:', currentDir);

  const dirContent: string[] = []
  try {
      // Read the contents of the current directory
      const files = fs.readdirSync(currentDir);

      // Log the contents of the directory
      console.log('Contents of the directory:', currentDir);
      files.forEach((file: string) => {
          console.log(file);
          dirContent.push(file)
      });
  } catch (err) {
      console.error('Unable to scan directory:', err);
  }

  res.status(200).send(JSON.stringify({currentDir, dirContent}, null, 2));
};
