// This config file is designed to be compatible with the official AWS CLI:
// $ aws lambda update-function-configuration \
//     --function-name MyLambdaFunction \
//     --environment $(node -p 'require("./lambda-multicast-proxy-config")')
// For more information, see: https://github.com/jareware/lambda-multicast-proxy
module.exports = JSON.stringify({
  Variables: {
    LAMBDA_MULTICAST_CONFIG: JSON.stringify({

      // How much detail to write to logs (one of 'debug' | 'info' | 'warn' | 'error'):
      logLevel: 'debug',

      // How long to wait before giving up on proxied requests:
      proxyTimeout: 5000,

      // When a regex in the key matches, the request will be proxied to the specified list of URL's:
      rewriteConfig: {

        // Dexcom uploads:
        '^/api/v1/(.*)': [
          // TODO
        ],

        // Parakeet uploads:
        '^/parakeet(.*)': [
          // TODO
        ],

      },

      // These headers from the client are forwarded to the proxy request:
      proxiedIncomingHeaders: [
        'authorization',
        'content-type',
        'user-agent',
        'x-request-id',
      ],

      // These headers from the proxy response are forwarded back to the client:
      proxiedOutgoingHeaders: [
        'content-type',
        'cache-control',
      ],

    }),
  },
});
