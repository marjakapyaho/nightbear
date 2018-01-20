import 'mocha';
import { assert } from 'chai';
import { proxyRequest, DEFAULT_TIMEOUT } from './proxy';

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

    const PROXIED_HEADERS = [
      'authorization',
      'content-type',
      'user-agent',
      'x-request-id',
    ];

    it('calls axios with correct params', () => {
      const axiosArgs: object[] = [];
      const fakeAxios = {
        request(args: object) {
          axiosArgs.push(args);
          return Promise.resolve({ status: 200 });
        },
      } as any;
      return proxyRequest(SAMPLE_REQUEST, OUTGOING_URLS, PROXIED_HEADERS, undefined, fakeAxios)
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
                  'X-Request-ID': '62c362a2-f949-11e7-907f-bf2bff7069b0',
                },
                params: {
                  foo: 'bar',
                },
                timeout: DEFAULT_TIMEOUT,
              },
              {
                url: 'http://two.com/',
                method: 'POST',
                data: 'Hello Lambda!',
                headers: {
                  'Content-Type': 'text/plain',
                  'User-Agent': 'Amazon CloudFront',
                  'X-Request-ID': '62c362a2-f949-11e7-907f-bf2bff7069b0',
                },
                params: {
                  foo: 'bar',
                },
                timeout: DEFAULT_TIMEOUT,
              },
            ],
          );
        });
    });

    it('resolves with the result of all operations', () => {
      const fakeAxios = {
        request(args: any) {
          return args.url === 'http://one.com/'
            ? Promise.resolve({ status: 200, statusText: 'OK', data: null, headers: {} })
            : Promise.reject({ response: { status: 404, statusText: 'Not Found', data: null, headers: {} } });
        },
      } as any;
      return proxyRequest(SAMPLE_REQUEST, OUTGOING_URLS, [], undefined, fakeAxios)
        .then(res => {
          assert.deepEqual(
            res,
            {
              'http://one.com/': { status: 200, statusText: 'OK', data: null, headers: {} },
              'http://two.com/': { status: 404, statusText: 'Not Found', data: null, headers: {} },
            },
          );
        });
    });

  });

});
