import { assert } from 'chai';
import { MIN_IN_MS } from 'core/calculations/calculations';
import { Request } from 'core/models/api';
import { DeviceStatus, DexcomCalibration, MeterEntry, ParakeetSensorEntry } from 'core/models/model';
import { sortBy } from 'lodash';
import 'mocha';
import {
  parseParakeetEntry,
  parseParakeetStatus,
  uploadParakeetEntry,
} from 'server/api/uploadParakeetEntry/uploadParakeetEntry';
import {
  assertEqualWithoutMeta,
  createTestContext,
  saveAndAssociate,
  withStorage,
  eraseModelUuid,
} from 'server/utils/test';
import { generateUuid } from 'core/utils/id';

describe('api/uploadParakeetEntry', () => {
  const context = createTestContext();
  const timestampNow = context.timestamp();

  // Mock requests
  const mockRequest: Request = {
    requestId: '',
    requestMethod: '',
    requestPath: '',
    requestHeaders: {},
    requestBody: {},
    requestParams: {
      rr: '6577574', // (assumed) cache buster
      zi: '6921800', // transmitter id
      pc: '53478', // passcode for parakeet upload
      lv: '168416', // unfiltered
      lf: '165824', // filtered
      db: '216', // battery level (transmitter)
      ts: '14934', // time since
      bp: '80', // battery level (parakeet)
      bm: '4047', // ???
      ct: '283', // ???
      gl: '60.193707,24.949396', // geolocation
    },
  };

  // Mock objects
  const mockDexcomEntry: MeterEntry = {
    modelType: 'MeterEntry',
    modelUuid: generateUuid(),
    timestamp: timestampNow - 2 * MIN_IN_MS,
    source: 'dexcom',
    bloodGlucose: 8.0,
  };

  const mockDexcomCalibration: DexcomCalibration = {
    modelType: 'DexcomCalibration',
    modelUuid: generateUuid(),
    timestamp: timestampNow - 2 * MIN_IN_MS,
    meterEntries: [],
    isInitialCalibration: false,
    slope: 828.3002146147081,
    intercept: 30000,
    scale: 0.9980735302684531,
  };

  const mockParakeetSensorEntry: ParakeetSensorEntry = {
    modelType: 'ParakeetSensorEntry',
    modelUuid: generateUuid(),
    timestamp: timestampNow - 14934, // requestParam ts (time since)
    bloodGlucose: 9.3, // was 8.7 with the old server
    rawFiltered: 165824,
    rawUnfiltered: 168416,
  };

  const mockDeviceStatus: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'parakeet',
    timestamp: timestampNow,
    batteryLevel: 80,
    geolocation: '60.193707,24.949396',
  };

  const mockDeviceStatusTransmitter: DeviceStatus = {
    modelType: 'DeviceStatus',
    modelUuid: generateUuid(),
    deviceName: 'dexcom-transmitter',
    timestamp: timestampNow,
    batteryLevel: 216,
    geolocation: null,
  };

  it('produces correct ParakeetSensorEntry', () => {
    assert.deepEqual(
      eraseModelUuid(parseParakeetEntry(mockRequest.requestParams, mockDexcomCalibration, context.timestamp())),
      eraseModelUuid(mockParakeetSensorEntry),
    );
  });

  it('produces correct DeviceStatus', () => {
    assert.deepEqual(
      parseParakeetStatus(mockRequest.requestParams, context.timestamp()).map(eraseModelUuid),
      [mockDeviceStatus, mockDeviceStatusTransmitter].map(eraseModelUuid),
    );
  });

  withStorage(createTestStorage => {
    it('uploads parakeet entry with correct response', () => {
      const context = createTestContext(createTestStorage());
      return Promise.resolve()
        .then(() => saveAndAssociate(context, mockDexcomCalibration, mockDexcomEntry))
        .then(() => uploadParakeetEntry(mockRequest, context))
        .then(res => {
          assert.equal(res.responseBody, '!ACK  0!');
        })
        .then(() => context.storage.loadLatestTimelineModels('ParakeetSensorEntry', 100))
        .then(models => assertEqualWithoutMeta(models.map(eraseModelUuid), [eraseModelUuid(mockParakeetSensorEntry)]))
        .then(() => context.storage.loadLatestTimelineModels('DeviceStatus', 100))
        .then(models =>
          assertEqualWithoutMeta(
            sortBy(models, 'deviceName').map(eraseModelUuid),
            [mockDeviceStatusTransmitter, mockDeviceStatus].map(eraseModelUuid),
          ),
        );
    });
  });
});
