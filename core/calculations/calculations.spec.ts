import { assert } from 'chai';
import 'mocha';
import {
  MIN_IN_MS,
  calculateHba1c,
  calculateRaw,
  changeBloodGlucoseUnitToMgdl,
  changeBloodGlucoseUnitToMmoll,
  isDexcomEntryValid,
  roundTo2Decimals,
  timestampIsUnderMaxAge,
} from './calculations';
import { sensorEntries1, sensorEntries2 } from './test-data/sensor-entries';

describe('core/calculations', () => {

  it('changeBloodGlucoseUnitToMmoll', () => {
    assert.deepEqual(changeBloodGlucoseUnitToMmoll(160), 8.9);
    assert.deepEqual(changeBloodGlucoseUnitToMmoll(60), 3.3);
    assert.deepEqual(changeBloodGlucoseUnitToMmoll(450), 25.0);
  });

  it('changeBloodGlucoseUnitToMgdl', () => {
    assert.deepEqual(changeBloodGlucoseUnitToMgdl(2.8), 50);
    assert.deepEqual(changeBloodGlucoseUnitToMgdl(11.0), 198);
    assert.deepEqual(changeBloodGlucoseUnitToMgdl(20.8), 374);
  });

  it('calculateRaw', () => {
    const testObj1 = {
      unfiltered: 204960,
      slope: 681.4329083181542,
      intercept: 30000,
      scale: 0.9977203313342593,
    };

    assert.deepEqual(
      calculateRaw(testObj1.unfiltered, testObj1.slope, testObj1.intercept, testObj1.scale),
      14.2, // Dexcom 14.2, old raw 13.3
    );

    const testObj2 = {
      unfiltered: 148224,
      slope: 645.2005532503458,
      intercept: 30000,
      scale: 1,
    };

    assert.deepEqual(
      calculateRaw(testObj2.unfiltered, testObj2.slope, testObj2.intercept, testObj2.scale),
      10.2, // Dexcom 9.8, old raw 9.3
    );

    const testObj3 = {
      unfiltered: 213408,
      slope: 0,
      intercept: 30000,
      scale: 0.9977203313342593,
    };

    assert.deepEqual(
      calculateRaw(testObj3.unfiltered, testObj3.slope, testObj3.intercept, testObj3.scale),
      null,
    );
  });

  it('isDexcomEntryValid', () => {
    assert.deepEqual(isDexcomEntryValid(4, 10), false); // Too much noise, too low bg
    assert.deepEqual(isDexcomEntryValid(2, 10), false); // Too low bg
    assert.deepEqual(isDexcomEntryValid(5, 100), false); // Too much noise
    assert.deepEqual(isDexcomEntryValid(3, 80), true);
  });

  it('roundTo2Decimals', () => {
    assert.deepEqual(roundTo2Decimals(34.0879), 34.09);
    assert.deepEqual(roundTo2Decimals(5.9999), 6.00);
    assert.deepEqual(roundTo2Decimals(2.457), 2.46);
  });

  it('timestampIsUnderMaxAge', () => {
    const currentTimestamp = 1521972451237;
    assert.deepEqual( timestampIsUnderMaxAge(currentTimestamp, currentTimestamp - 10 * MIN_IN_MS, 20 ), true );
    assert.deepEqual( timestampIsUnderMaxAge(currentTimestamp, currentTimestamp - 30 * MIN_IN_MS, 20 ), false );
  });

  it('calculateHba1c', () => {
    assert.deepEqual(calculateHba1c(sensorEntries1), 5.3278247884519665);
    assert.deepEqual(calculateHba1c(sensorEntries2), 8.56326530612245);
  });
});
