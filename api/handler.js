'use strict';

require('dotenv').config();

// Your first function handler
module.exports.hello = (event, context, cb) => {
  cb(null, {
    message: 'Hello from Nightbear API',
    dbUrl: process.env.NIGHTBEAR_API_DB_URL
  });
};

// You can add more handlers here, and reference them in serverless.yml
