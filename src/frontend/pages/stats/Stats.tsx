import React from 'react';
import { reallyHighLimit, reallyLowLimit } from 'frontend/utils/config';
import { fontColor, nbCarbs, nbGood, nbHigh, nbInsulin, nbLow } from 'frontend/utils/colors';
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
} from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';
import styles from './Stats.module.scss';
import { StatLine } from 'frontend/pages/stats/StatLine';
import { StatGraph } from 'frontend/pages/stats/StatGraph';
import { useTimelineEntries } from 'frontend/data/timelineEntries/useTimelineEntries';

export const Stats = () => {
  const { timelineEntries } = useTimelineEntries(Date.now() - 30 * DAY_IN_MS);
  const { sensorEntries, insulinEntries, carbEntries, meterEntries } = timelineEntries;

  // Override sensor entries with meter entries where necessary
  const bgEntries = sensorEntries.map(sensorEntry => {
    const meterEntry = meterEntries.find(meterEntry => meterEntry.timestamp === sensorEntry.timestamp);
    return meterEntry?.bloodGlucose ? { ...sensorEntry, bloodGlucose: meterEntry.bloodGlucose } : sensorEntry;
  });

  const timeInRange = calculateTimeInRange(bgEntries) || '';
  const timeLow = calculateTimeLow(bgEntries) || '';
  const timeHigh = calculateTimeHigh(bgEntries) || '';
  const hba1c = setOneDecimal(calculateHba1c(bgEntries)) || '';

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
  const dailyAverageBgs = calculateDailyAverageBgs(bgEntries, daysToShow).map(val => ({
    timestamp: val.timestamp,
    val: val.average,
    color: fontColor,
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

      <StatLine title="Avg BG" subtitle="for 7 days" figure={getBgAverage(bgEntries)} color={nbGood} />
      <StatLine title="Hba1c" subtitle="for 7 days" figure={hba1c} color={nbGood} />
      <StatLine title="LOW" subtitle="below 3.7" figure={countSituations(bgEntries, 3.7, true)} color={nbLow} />
      <StatLine
        title="LOW"
        subtitle="below 3.0"
        figure={countSituations(bgEntries, reallyLowLimit, true)}
        color={nbLow}
      />
      <StatLine
        title="HIGH"
        subtitle={`over ${reallyHighLimit}`}
        figure={countSituations(bgEntries, reallyHighLimit, false)}
        color={nbHigh}
      />
    </div>
  );
};
