import { Alarm } from 'shared/types/alarms';
import { DexcomG6ShareEntry } from 'shared/types/dexcom';
import { MIN_IN_MS } from 'shared/utils/calculations';
import { generateUuid } from 'shared/utils/id';
import { describe } from 'vitest';
import { mockNow } from 'shared/mocks/dates';
/*

describe('server/main/check-runner', () => {
  const timestampNow = 1508672249758;

  const mockDexcomSensorEntry: DexcomG6ShareEntry = {
    id: '1',
    timestamp: timestampNow - 3 * MIN_IN_MS,
    bloodGlucose: 16,
    signalStrength: 168,
    noiseLevel: 1,
  };

  const alarmsArrayWithHigh: Alarm[] = [
    {
      id: generateUuid(),
      timestamp: mockNow,
      situation: 'HIGH',
      isActive: true,
      deactivatedAt: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: mockNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  const alarmsArrayWithHighAndBattery: Alarm[] = [
    {
      id: '1',
      timestamp: mockNow,
      situation: 'HIGH',
      isActive: true,
      deactivatedAt: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: mockNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
        {
          alarmLevel: 2,
          validAfterTimestamp: mockNow,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
    {
      id: '1',
      timestamp: timestampNow + 15 * MIN_IN_MS,
      situation: 'OUTDATED',
      isActive: true,
      deactivatedAt: null,
      alarmStates: [
        {
          alarmLevel: 1,
          validAfterTimestamp: timestampNow + 15 * MIN_IN_MS,
          ackedBy: null,
          pushoverReceipts: [],
        },
      ],
    },
  ];

  // TODO
  /!*  withStorage(createTestStorage => {
    it('checks', () => {
      let timestamp = timestampNow;
      const context = createTestContext(createTestStorage(), () => timestamp);
      return Promise.resolve()
        .then(() => context.storage.saveModel(activeProfile('day', timestamp)))
        .then(() => context.storage.saveModel(mockDexcomCalibration))
        .then(() => context.storage.saveModel(mockDexcomSensorEntry))
        .then(() => checks(context, getDefaultJournalContent()))
        .then(() => context.storage.loadTimelineModels(['Alarm'], ALARM_FETCH_RANGE, context.timestamp()))
        .then(alarms => assertEqualWithoutMeta(alarms.map(eraseModelUuid), alarmsArrayWithHigh.map(eraseModelUuid)))
        .then(() => context.storage.saveModel(mockDeviceStatus))
        .then(() => (timestamp += 15 * MIN_IN_MS))
        .then(() => checks(context, getDefaultJournalContent()))
        .then(() => context.storage.loadTimelineModels(['Alarm'], ALARM_FETCH_RANGE, context.timestamp()))
        .then(alarms =>
          assertEqualWithoutMeta(alarms.map(eraseModelUuid), alarmsArrayWithHighAndBattery.map(eraseModelUuid)),
        );
    });
  });*!/
});
*/
