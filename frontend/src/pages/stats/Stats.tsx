import { reallyHighLimit, reallyLowLimit } from '@nightbear/shared'
import {
  calculateHba1c,
  countSituations,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  getBgAverage,
  DAY_IN_MS,
  calculateDailyAmounts,
  calculateDailyAverageBgs,
  setOneDecimal,
  getTimeAsISOStr,
  getTimeInMillis,
} from '@nightbear/shared'
import styles from './Stats.module.scss'
import { StatLine } from './StatLine'
import { StatGraph } from './StatGraph'
import { useTimelineEntries } from '../../data/timelineEntries/useTimelineEntries'

export const Stats = () => {
  const { timelineEntries } = useTimelineEntries(getTimeAsISOStr(Date.now() - 30 * DAY_IN_MS))
  const { bloodGlucoseEntries, insulinEntries, carbEntries } = timelineEntries

  // Override sensor entries with meter entries where necessary
  const timeInRange = calculateTimeInRange(bloodGlucoseEntries) || ''
  const timeLow = calculateTimeLow(bloodGlucoseEntries) || ''
  const timeHigh = calculateTimeHigh(bloodGlucoseEntries) || ''
  const hba1c = setOneDecimal(calculateHba1c(bloodGlucoseEntries)) || ''

  const daysToShow = 28
  const dailyInsulins = calculateDailyAmounts(insulinEntries, daysToShow).map(val => ({
    isoTimestamp: val.timestamp,
    timestamp: getTimeInMillis(val.timestamp),
    val: val.total,
    color: '#EE776E',
  }))
  const dailyCarbs = calculateDailyAmounts(carbEntries, daysToShow).map(val => ({
    isoTimestamp: val.timestamp,
    timestamp: getTimeInMillis(val.timestamp),
    val: val.total,
    color: '#9AD5B3',
  }))
  const dailyAverageBgs = calculateDailyAverageBgs(bloodGlucoseEntries, daysToShow).map(val => ({
    isoTimestamp: val.timestamp,
    timestamp: getTimeInMillis(val.timestamp),
    val: val.average,
    color: '#777',
  }))

  return (
    <div className={styles.stats}>
      <div className={styles.statBalls}>
        <div className={`${styles.stat} ${styles.good}`}>
          Good <strong className={styles.statStrong}>{timeInRange}%</strong>
        </div>
        <div className={`${styles.stat} ${styles.low}`}>
          Low <strong className={styles.statStrong}>{timeLow}%</strong>
        </div>
        <div className={`${styles.stat} ${styles.high}`}>
          High <strong className={styles.statStrong}>{timeHigh}%</strong>
        </div>
      </div>

      <StatGraph
        label="Blood glucose"
        points={dailyAverageBgs}
        daysToShow={daysToShow}
        valMin={2}
        valMax={14}
        valStep={1}
        decimals={1}
      />
      <StatGraph
        label="Insulins"
        points={dailyInsulins}
        daysToShow={daysToShow}
        valMin={0}
        valMax={40}
        valStep={5}
        decimals={0}
      />
      <StatGraph
        label="Carbs"
        points={dailyCarbs}
        daysToShow={daysToShow}
        valMin={50}
        valMax={300}
        valStep={50}
        decimals={0}
      />

      <StatLine
        title="Avg BG"
        subtitle="for 7 days"
        figure={getBgAverage(bloodGlucoseEntries)}
        color="#54c87e"
      />
      <StatLine title="Hba1c" subtitle="for 7 days" figure={hba1c} color="#54c87e" />
      <StatLine
        title="LOW"
        subtitle="below 3.7"
        figure={countSituations(bloodGlucoseEntries, 3.7, true)}
        color="#ee5a36"
      />
      <StatLine
        title="LOW"
        subtitle="below 3.0"
        figure={countSituations(bloodGlucoseEntries, reallyLowLimit, true)}
        color="#ee5a36"
      />
      <StatLine
        title="HIGH"
        subtitle={`over ${reallyHighLimit}`}
        figure={countSituations(bloodGlucoseEntries, reallyHighLimit, false)}
        color="#F8CC6F"
      />
    </div>
  )
}
