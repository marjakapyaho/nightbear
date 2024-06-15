import {
  reallyHighLimit,
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
  isNotNullish,
} from '@nightbear/shared'
import styles from './Stats.module.scss'
import { StatLine } from './StatLine'
import { StatGraph } from './StatGraph'
import { useTimelineEntries } from '../../data/timelineEntries/useTimelineEntries'

export const Stats = () => {
  const { graphPoints } = useTimelineEntries(getTimeAsISOStr(Date.now() - 30 * DAY_IN_MS))

  const bgs = graphPoints.map(p => p.val).filter(isNotNullish)
  const timeInRange = calculateTimeInRange(bgs) || ''
  const timeLow = calculateTimeLow(bgs) || ''
  const timeHigh = calculateTimeHigh(bgs) || ''
  const hba1c = setOneDecimal(calculateHba1c(bgs)) || ''

  const situations = graphPoints
    .flatMap(p => p.alarms)
    .filter(isNotNullish)
    .map(alarm => alarm.situation)

  const daysToShow = 28
  const dailyInsulins = calculateDailyAmounts(
    graphPoints.map(p => p.insulinEntry).filter(isNotNullish),
    daysToShow,
  ).map(val => ({
    isoTimestamp: val.timestamp,
    timestamp: getTimeInMillis(val.timestamp),
    val: val.total,
    color: '#EE776E',
  }))
  const dailyCarbs = calculateDailyAmounts(
    graphPoints.map(p => p.carbEntry).filter(isNotNullish),
    daysToShow,
  ).map(val => ({
    isoTimestamp: val.timestamp,
    timestamp: getTimeInMillis(val.timestamp),
    val: val.total,
    color: '#9AD5B3',
  }))
  const dailyAverageBgs = calculateDailyAverageBgs(
    graphPoints
      .map(p => (p.val ? { timestamp: p.isoTimestamp, bloodGlucose: p.val } : null))
      .filter(isNotNullish),
    daysToShow,
  ).map(val => ({
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

      <StatLine title="Avg BG" subtitle="for 7 days" figure={getBgAverage(bgs)} color="#54c87e" />
      <StatLine title="Hba1c" subtitle="for 7 days" figure={hba1c} color="#54c87e" />
      <StatLine
        title="LOW"
        subtitle="below 3.7"
        figure={countSituations(situations, 'LOW')}
        color="#ee5a36"
      />
      <StatLine
        title="BAD LOW"
        subtitle="below 3.0"
        figure={countSituations(situations, 'BAD_LOW')}
        color="#ee5a36"
      />
      <StatLine
        title="BAD HIGH"
        subtitle={`over ${reallyHighLimit}`}
        figure={countSituations(situations, 'BAD_HIGH')}
        color="#F8CC6F"
      />
    </div>
  )
}
