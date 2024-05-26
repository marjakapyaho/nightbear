import { BaseGraphConfig, Point } from '../../components/scrollableGraph/scrollableGraphUtils'
import { DAY_IN_MS, HOUR_IN_MS, MIN_IN_MS, highLimit, lowLimit } from '@nightbear/shared'
import { InsulinEntryType } from '@nightbear/shared'
import { chain } from 'lodash'

export const getFillColor = (bg: number | null) => {
  if (!bg) {
    return 'white'
  }
  if (bg > highLimit) {
    return '#F8CC6F'
  }
  if (bg < lowLimit) {
    return '#ee5a36'
  }
  return '#54c87e'
}

export const getBgGraphBaseConfig = (): BaseGraphConfig => ({
  timelineRange: DAY_IN_MS,
  timelineRangeEnd: Date.now(),
  paddingTop: 10,
  paddingBottom: 40,
  paddingLeft: 0,
  paddingRight: 30,
  outerHeight: 330,
  valMin: 0,
  valMax: 20,
  valStep: 1,
  timeStep: HOUR_IN_MS,
  dataTimeStep: 5 * MIN_IN_MS,
  pixelsPerTimeStep: 100,
  showTarget: true,
  showCurrentValue: true,
  timeFormat: 'hh:mm',
  showEveryNthTimeLabel: 1,
  decimals: 1,
})

export const getNewSelectedPointWithCarbs = (newAmount: number, basePoint?: Point) =>
  basePoint
    ? {
        ...basePoint,
        carbEntry: {
          timestamp: basePoint.isoTimestamp,
          amount: newAmount,
          durationFactor: 1,
        },
      }
    : null

export const getNewSelectedPointWithMeterEntry = (newBg: number, basePoint?: Point) =>
  basePoint
    ? {
        ...basePoint,
        meterEntry: {
          timestamp: basePoint.isoTimestamp,
          bloodGlucose: newBg,
        },
      }
    : null

export const getNewSelectedPointWithInsulin = (newAmount: number, basePoint?: Point) =>
  basePoint
    ? {
        ...basePoint,
        insulinEntry: {
          timestamp: basePoint.isoTimestamp,
          amount: newAmount,
          type: 'FAST' as InsulinEntryType,
        },
      }
    : null

export const findLatestPointWithBloodGlucose = (points: Point[]) =>
  chain(points)
    .filter(point => Boolean(point.val))
    .last()
    .value()
