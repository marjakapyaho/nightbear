import { DexcomCalibration } from './model';

// Conversion from mg/dL to mmol/L (rounds to 1 decimal)
export function changeBloodGlucoseUnitToMmoll(glucoseInMgdl: number) {
  return Math.round((glucoseInMgdl / 18) * 10) / 10;
}

// Conversion from mmol/L to mg/dL
export function changeBloodGlucoseUnitToMgdl(glucoseInMmoll: number) {
  const numeric = Math.floor(10 * glucoseInMmoll) / 10;
  return Math.round(18 * numeric);
}

// Calculates actual blood glucose in mmol/L from raw values and calibration
export function calculateRaw(filtered: number, unfiltered: number, calibration: DexcomCalibration) {
  let raw = 0;

  if (calibration.slope === 0 || unfiltered === 0 || calibration.scale === 0) {
    raw = 0;
  }
  else if (filtered === 0) {
    raw = calibration.scale * (unfiltered - calibration.intercept) / calibration.slope;
  }
  else {
    raw = calibration.scale * (unfiltered - calibration.intercept) / calibration.slope;
  }
  return changeBloodGlucoseUnitToMmoll(raw);
}
