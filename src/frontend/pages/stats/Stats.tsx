import React, { useEffect } from 'react';
import { getEntriesFeed } from 'frontend/data/data/getters';
import { useReduxActions, useReduxState } from 'frontend/utils/react';
import { reallyHighLimit, reallyLowLimit } from 'frontend/utils/config';
import { nbCarbs, nbGood, nbHigh, nbInsulin, nbLow } from 'frontend/utils/colors';
import { is } from 'shared/models/utils';
import {
  calculateHba1c,
  countSituations,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  getBgAverage,
} from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';
import styles from './Stats.module.scss';
import { StatLine } from 'frontend/pages/stats/StatLine';
import { StatGraph } from 'frontend/pages/stats/StatGraph';
import { calculateDailyAmounts } from 'frontend/pages/stats/statsUtils';

export const Stats = () => {
  const dataState = useReduxState(s => s.data);
  const navigationState = useReduxState(s => s.navigation);
  const actions = useReduxActions();

  const bgModels = getEntriesFeed(dataState);
  const insulins = dataState.timelineModels.filter(is('Insulin'));
  const carbs = dataState.timelineModels.filter(is('Carbs'));

  const timeInRange = calculateTimeInRange(bgModels) || '';
  const timeLow = calculateTimeLow(bgModels) || '';
  const timeHigh = calculateTimeHigh(bgModels) || '';
  const hba1c = setOneDecimal(calculateHba1c(bgModels)) || '';

  const daysToShow = 30;
  const dailyInsulins = calculateDailyAmounts(insulins, daysToShow).map(val => ({
    timestamp: val.timestamp,
    val: val.total,
    color: nbInsulin,
  }));
  const dailyCarbs = calculateDailyAmounts(carbs, daysToShow).map(val => ({
    timestamp: val.timestamp,
    val: val.total,
    color: nbCarbs,
  }));

  useEffect(() => {
    actions.UI_NAVIGATED('Stats');
    // eslint-disable-next-line
  }, []);

  if (navigationState.selectedScreen !== 'Stats') return null;

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

      <StatLine title="Avg BG" subtitle="for 7 days" figure={getBgAverage(bgModels)} color={nbGood} />
      <StatLine title="Hba1c" subtitle="for 7 days" figure={hba1c} color={nbGood} />
      <StatLine title="LOW" subtitle="below 3.7" figure={countSituations(bgModels, 3.7, true)} color={nbLow} />
      <StatLine
        title="LOW"
        subtitle="below 3.0"
        figure={countSituations(bgModels, reallyLowLimit, true)}
        color={nbLow}
      />
      <StatLine
        title="HIGH"
        subtitle={`over ${reallyHighLimit}`}
        figure={countSituations(bgModels, reallyHighLimit, false)}
        color={nbHigh}
      />
    </div>
  );
};
