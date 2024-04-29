import { SensorEntry } from 'shared/types/timelineEntries';
import {
  MIN_IN_MS,
  calculateHba1c,
  calculateRaw,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  changeBloodGlucoseUnitToMgdl,
  changeBloodGlucoseUnitToMmoll,
  countSituations,
  getBgAverage,
  isDexcomEntryValid,
  roundTo2Decimals,
  timestampIsUnderMaxAge,
} from 'shared/utils/calculations';
import { getTimeMinusTime } from 'shared/utils/time';
import { describe, expect, it } from 'vitest';

const currentTimestamp = 1508672249758;

export const sensorEntries1: SensorEntry[] = [
  {
    timestamp: getTimeMinusTime(currentTimestamp, 35),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 30),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 25),
    bloodGlucose: 6,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 20),
    bloodGlucose: 8,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 15),
    bloodGlucose: 7,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 10),
    bloodGlucose: 7,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 5),
    bloodGlucose: 8,
    type: 'DEXCOM_G6_SHARE',
  },
];

export const sensorEntries2: SensorEntry[] = [
  {
    timestamp: getTimeMinusTime(currentTimestamp, 35),
    bloodGlucose: 14,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 30),
    bloodGlucose: 11,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 25),
    bloodGlucose: 11.5,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 20),
    bloodGlucose: 12.5,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 15),
    bloodGlucose: 13.1,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 10),
    bloodGlucose: 12,
    type: 'DEXCOM_G6_SHARE',
  },
  {
    timestamp: getTimeMinusTime(currentTimestamp, 5),
    bloodGlucose: 10,
    type: 'DEXCOM_G6_SHARE',
  },
];

describe('shared/calculations', () => {
  it('changeBloodGlucoseUnitToMmoll', () => {
    expect(changeBloodGlucoseUnitToMmoll(160)).toEqual(8.9);
    expect(changeBloodGlucoseUnitToMmoll(60)).toEqual(3.3);
    expect(changeBloodGlucoseUnitToMmoll(450)).toEqual(25.0);
  });

  it('changeBloodGlucoseUnitToMgdl', () => {
    expect(changeBloodGlucoseUnitToMgdl(2.8)).toEqual(50);
    expect(changeBloodGlucoseUnitToMgdl(11.0)).toEqual(198);
    expect(changeBloodGlucoseUnitToMgdl(20.8)).toEqual(374);
  });

  it('calculateRaw', () => {
    const testObj1 = {
      unfiltered: 204960,
      slope: 681.4329083181542,
      intercept: 30000,
      scale: 0.9977203313342593,
    };

    expect(
      calculateRaw(testObj1.unfiltered, testObj1.slope, testObj1.intercept, testObj1.scale),
    ).toEqual(
      14.2, // Dexcom 14.2, old raw 13.3
    );

    const testObj2 = {
      unfiltered: 148224,
      slope: 645.2005532503458,
      intercept: 30000,
      scale: 1,
    };

    expect(
      calculateRaw(testObj2.unfiltered, testObj2.slope, testObj2.intercept, testObj2.scale),
    ).toEqual(
      10.2, // Dexcom 9.8, old raw 9.3
    );

    const testObj3 = {
      unfiltered: 213408,
      slope: 0,
      intercept: 30000,
      scale: 0.9977203313342593,
    };

    expect(
      calculateRaw(testObj3.unfiltered, testObj3.slope, testObj3.intercept, testObj3.scale),
    ).toBeNull();
  });

  it('isDexcomEntryValid', () => {
    expect(isDexcomEntryValid(4, 10)).toEqual(false); // Too much noise, too low bg
    expect(isDexcomEntryValid(2, 10)).toEqual(false); // Too low bg
    expect(isDexcomEntryValid(5, 100)).toEqual(false); // Too much noise
    expect(isDexcomEntryValid(3, 80)).toEqual(true);
  });

  it('roundTo2Decimals', () => {
    expect(roundTo2Decimals(34.0879)).toEqual(34.09);
    expect(roundTo2Decimals(5.9999)).toEqual(6.0);
    expect(roundTo2Decimals(2.457)).toEqual(2.46);
  });

  it('timestampIsUnderMaxAge', () => {
    const currentTimestamp = 1521972451237;
    expect(timestampIsUnderMaxAge(currentTimestamp, currentTimestamp - 10 * MIN_IN_MS, 20)).toEqual(
      true,
    );
    expect(timestampIsUnderMaxAge(currentTimestamp, currentTimestamp - 30 * MIN_IN_MS, 20)).toEqual(
      false,
    );
  });

  it('calculateHba1c', () => {
    expect(calculateHba1c(sensorEntries1)).toEqual(5.3278247884519665);
    expect(calculateHba1c(sensorEntries2)).toEqual(8.56326530612245);
  });

  it('calculateTimeInRange', () => {
    expect(calculateTimeInRange(sensorEntries1)).toEqual(100);
    expect(calculateTimeInRange(sensorEntries2)).toEqual(14);
  });

  it('calculateTimeLow', () => {
    expect(calculateTimeLow(sensorEntries1)).toEqual(0);
    expect(calculateTimeLow(sensorEntries2)).toEqual(0);
  });

  it('calculateTimeHigh', () => {
    expect(calculateTimeHigh(sensorEntries1)).toEqual(0);
    expect(calculateTimeHigh(sensorEntries2)).toEqual(86);
  });

  it('countSituations', () => {
    expect(countSituations(sensorEntries1, 7.5, true)).toEqual(2);
    expect(countSituations(sensorEntries2, 13, false)).toEqual(2);
  });

  it('getBgAverage', () => {
    expect(getBgAverage(sensorEntries1)).toEqual('6.9');
    expect(getBgAverage(sensorEntries2)).toEqual('12.0');
  });

  // TODO: check these
  /*  it('calculateDailyAmounts', () => {
    expect(calculateDailyAmounts(mockCarbEntries, 2, getTimeInMillis(mockNow))).toEqual([
      { timestamp: mockNow, total: 40 },
      { timestamp: getTimeAsISOStr(getTimeInMillis(mockNow) - 24 * HOUR_IN_MS), total: null },
    ]);
  });*/

  // TODO: check these
  /*  it('calculateDailyAverageBgs', () => {
    expect(calculateDailyAverageBgs(mockSensorEntries, 2, getTimeInMillis(mockNow))).toEqual([
      { average: 5.5, timestamp: mockNow },
      { average: null, timestamp: getTimeAsISOStr(getTimeInMillis(mockNow) - 24 * HOUR_IN_MS) },
    ]);
  });*/
});
