import React from 'react';
import { reallyHighLimit, reallyLowLimit } from 'frontend/utils/config';
import { nbCarbs, nbGood, nbHigh, nbInsulin, nbLow } from 'frontend/utils/colors';
import {
  calculateHba1c,
  countSituations,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  getBgAverage,
  DAY_IN_MS,
} from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';
import styles from './Stats.module.scss';
import { StatLine } from 'frontend/pages/stats/StatLine';
import { StatGraph } from 'frontend/pages/stats/StatGraph';
import { calculateDailyAmounts } from 'frontend/pages/stats/statsUtils';
import { useTimelineEntries } from 'frontend/data/timelineEntries/useTimelineEntries';

export const Stats = () => {
  const { timelineEntries } = useTimelineEntries(Date.now() - 30 * DAY_IN_MS);
  const { bloodGlucoseEntries, insulinEntries, carbEntries } = timelineEntries;
  // TODO: consider meterEntries here
  const timeInRange = calculateTimeInRange(bloodGlucoseEntries) || '';
  const timeLow = calculateTimeLow(bloodGlucoseEntries) || '';
  const timeHigh = calculateTimeHigh(bloodGlucoseEntries) || '';
  const hba1c = setOneDecimal(calculateHba1c(bloodGlucoseEntries)) || '';

  const daysToShow = 60;
  const dailyInsulins = calculateDailyAmounts(insulinEntries, daysToShow).map(val => ({
    timestamp: val.timestamp,
    val: val.total,
    color: nbInsulin,
  }));
  const dailyCarbs = calculateDailyAmounts(carbEntries, daysToShow).map(val => ({
    timestamp: val.timestamp,
    val: val.total,
    color: nbCarbs,
  }));

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

      <StatGraph label="Insulins" points={dailyInsulins} daysToShow={daysToShow} valMin={0} valMax={40} valStep={5} />
      <StatGraph label="Carbs" points={dailyCarbs} daysToShow={daysToShow} valMin={50} valMax={300} valStep={50} />

      <StatLine title="Avg BG" subtitle="for 7 days" figure={getBgAverage(bloodGlucoseEntries)} color={nbGood} />
      <StatLine title="Hba1c" subtitle="for 7 days" figure={hba1c} color={nbGood} />
      <StatLine
        title="LOW"
        subtitle="below 3.7"
        figure={countSituations(bloodGlucoseEntries, 3.7, true)}
        color={nbLow}
      />
      <StatLine
        title="LOW"
        subtitle="below 3.0"
        figure={countSituations(bloodGlucoseEntries, reallyLowLimit, true)}
        color={nbLow}
      />
      <StatLine
        title="HIGH"
        subtitle={`over ${reallyHighLimit}`}
        figure={countSituations(bloodGlucoseEntries, reallyHighLimit, false)}
        color={nbHigh}
      />
    </div>
  );
};
