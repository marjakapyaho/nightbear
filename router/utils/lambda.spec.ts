import 'mocha';
import { assert } from 'chai';
import { normalizeIncomingRequest } from './lambda';

describe('utils/lambda', () => {

  describe('normalizeIncomingRequest()', () => {

    // Note: This assumes a request pipeline of CloudFront -> API Gateway -> Lambda
    const SAMPLE_EVENT = {
      resource: '/{proxy+}',
      path: '/test/request',
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Amazon CloudFront',
      },
      queryStringParameters: {
        foo: 'bar',
      },
      pathParameters: {
        proxy: 'test/request',
      },
      stageVariables: null,
      requestContext: {
        requestTime: '14/Jan/2018:16:38:44 +0000',
        path: '/default/test/request',
        protocol: 'HTTP/1.1',
        stage: 'default',
        requestTimeEpoch: 1515947924299,
        requestId: '62c362a2-f949-11e7-907f-bf2bff7069b0',
        identity: {
          sourceIp: '123.123.123.123',
          userAgent: 'Amazon CloudFront',
        },
        resourcePath: '/{proxy+}',
        httpMethod: 'POST',
      },
      body: 'Hello Lambda!',
      isBase64Encoded: false,
    };

    it('works as expected', () => {
      assert.deepEqual(
        normalizeIncomingRequest(SAMPLE_EVENT),
        {
          requestId: '62c362a2-f949-11e7-907f-bf2bff7069b0',
          requestMethod: 'POST',
          requestPath: '/test/request',
          requestParams: { foo: 'bar' },
          requestHeaders: {
            'Content-Type': 'text/plain',
            'User-Agent': 'Amazon CloudFront',
          },
          requestBody: 'Hello Lambda!',
        },
      );
    });

  });

});
