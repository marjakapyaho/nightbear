import 'mocha';
import { assert } from 'chai';
import { rewriteIncomingUrl } from './rewrite';

describe('utils/rewrite', () => {

  describe('rewriteIncomingUrl()', () => {

    const CONFIG = {
      '^/dexcom/(.*)': [
        'http://legacy.nightbear.fi/api/v1/$1',
        'https://server.nightbear.fi/dexcom-upload-v2',
      ],
      '^/parakeet(.*)': [
        'http://legacy.nightbear.fi/api/v1/entries$1',
        'https://server.nightbear.fi/parakeet-upload-v2$1',
      ],
    };

    it('works for Dexcom uploads', () => {
      assert.deepEqual(
        rewriteIncomingUrl(CONFIG, /* POST http://router.nightbear.fi */ '/dexcom/entries'),
        [
          /* POST */ 'http://legacy.nightbear.fi/api/v1/entries', // (set in stone)
          /* POST */ 'https://server.nightbear.fi/dexcom-upload-v2',
        ],
      );
    });

    it('works for Dexcom device status uploads', () => {
      assert.deepEqual(
        rewriteIncomingUrl(CONFIG, /* POST http://router.nightbear.fi */ '/dexcom/devicestatus'),
        [
          /* POST */ 'http://legacy.nightbear.fi/api/v1/devicestatus', // (set in stone)
          /* POST */ 'https://server.nightbear.fi/dexcom-upload-v2',
        ],
      );
    });

    it('works for Parakeet uploads', () => {
      assert.deepEqual(
        rewriteIncomingUrl(CONFIG, /* GET http://router.nightbear.fi */ '/parakeet?rr=123&zi=456&pc=789'),
        [
          /* GET */ 'http://legacy.nightbear.fi/api/v1/entries?rr=123&zi=456&pc=789', // (set in stone)
          /* GET */ 'https://server.nightbear.fi/parakeet-upload-v2?rr=123&zi=456&pc=789',
        ],
      );
    });

    it('works for multiple matching patterns', () => {
      const config = {
        '^.*$': [ 'http://foo.com/' ],
        '..*$': [ 'http://bar.com/' ],
      };
      assert.deepEqual(
        rewriteIncomingUrl(config, '/whatever'),
        [
          'http://foo.com/',
          'http://bar.com/',
        ],
      );
    });

  });

});
