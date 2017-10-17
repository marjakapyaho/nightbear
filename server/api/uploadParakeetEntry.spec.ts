import 'mocha';
import { assert } from 'chai';
import { uploadParakeetEntry } from './uploadParakeetEntry';
import { Request } from '../utils/api';

describe('api/uploadParakeetEntry', () => {

  it('uploads parakeet entry', () => {
    const mockRequest: Request = {
      requestId: '',
      requestMethod: '',
      requestPath: '',
      requestHeaders: {},
      requestBody: {},
      requestParams: {
        rr: '2867847',
        zi: '6921800',
        pc: '53478',
        lv: '89472', // unfiltered
        lf: '102912', // filtered
        db: '216',
        ts: '14909',
        bp: '72',
        bm: '3981',
        ct: '279',
        gl: '60.193707,24.949396',
      },
    };

    return uploadParakeetEntry(mockRequest)
      .then(res => {
        assert.equal(
          res.responseBody,
          '!ACK  0!',
        );
      });
  });

});
