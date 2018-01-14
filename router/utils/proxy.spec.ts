import 'mocha';
import { assert } from 'chai';
import { proxyRequest } from './proxy';

describe('utils/proxy', () => {

  describe('proxyRequest()', () => {

    const SAMPLE_REQUEST = {
      requestId: '62c362a2-f949-11e7-907f-bf2bff7069b0',
      requestMethod: 'POST',
      requestPath: '/test/request',
      requestParams: { foo: 'bar' },
      requestHeaders: {
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/plain',
        'User-Agent': 'Amazon CloudFront',
      },
      requestBody: 'Hello Lambda!',
    };

    const OUTGOING_URLS = [
      'http://one.com/',
      'http://two.com/',
    ];

    it('calls axios with correct params', () => {
      const axiosArgs: object[] = [];
      const fakeAxios = {
        request(args: object) {
          axiosArgs.push(args);
          return Promise.resolve();
        },
      } as any;
      return proxyRequest(SAMPLE_REQUEST, OUTGOING_URLS, fakeAxios)
        .then(() => {
          assert.deepEqual(
            axiosArgs,
            [
              {
                url: 'http://one.com/',
                method: 'POST',
                data: 'Hello Lambda!',
                headers: {
                  'Content-Type': 'text/plain',
                  'User-Agent': 'Amazon CloudFront',
                },
                params: {
                  foo: 'bar',
                },
              },
              {
                url: 'http://two.com/',
                method: 'POST',
                data: 'Hello Lambda!',
                headers: {
                  'Content-Type': 'text/plain',
                  'User-Agent': 'Amazon CloudFront',
                },
                params: {
                  foo: 'bar',
                },
              },
            ],
          );
        });
    });

  });

});
