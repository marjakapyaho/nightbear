import { runAnalysis } from '../analyser';
import { generateSensorEntries, getMockActiveProfile } from '../../../shared';
import { describe, expect, it } from 'vitest';
import { mockNow } from '../../../shared';

describe('analyser/outdated', () => {
  it('detects OUTDATED when data is outside timeSinceBgLimit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.2, 6.0, 6.1, 6.0, 5.9], // No predicted low
          latestEntryAge: 35,
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('OUTDATED');
  });

  it('does not detect OUTDATED when data is inside timeSinceBgLimit', () => {
    expect(
      runAnalysis({
        currentTimestamp: mockNow,
        activeProfile: getMockActiveProfile('day'),
        sensorEntries: generateSensorEntries({
          currentTimestamp: mockNow,
          bloodGlucoseHistory: [6.2, 6.0, 6.1, 6.0, 5.9], // No predicted low
          latestEntryAge: 25,
        }),
        meterEntries: [],
        insulinEntries: [],
        carbEntries: [],
        alarms: [],
      }),
    ).toEqual('NO_SITUATION');
  });
});
