import { Hba1c } from 'core/models/model';
import 'mocha';
import { getHba1cHistory } from 'server/api/getHba1cHistory/getHba1cHistory';
import { assertEqualWithoutMeta, createTestContext, createTestRequest, withStorage } from 'server/utils/test';
import { generateUuid } from 'core/utils/id';

describe('api/getHba1cHistory', () => {
  const request = createTestRequest();

  const mockHba1c: Hba1c = {
    modelType: 'Hba1c',
    modelUuid: generateUuid(),
    source: 'calculated',
    timestamp: 1508672249758,
    hba1cValue: 6.6,
  };

  const mockResponseJson = [mockHba1c];

  withStorage(createTestStorage => {
    it('get Hba1c history', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => context.storage.saveModel(mockHba1c))
        .then(() => getHba1cHistory(request, context))
        .then(res => assertEqualWithoutMeta(res.responseBody as any, mockResponseJson));
    });
  });
});
