import React, { useEffect } from 'react';
import { getEntriesFeed } from 'frontend/data/data/getters';
import { useReduxActions, useReduxState } from 'frontend/utils/react';
import { reallyHighLimit, reallyLowLimit } from 'frontend/utils/config';
import { nbGood, nbHigh, nbLow, fontColor } from 'frontend/utils/colors';
import { is } from 'shared/models/utils';
import {
  calculateHba1c,
  calculateInsulinPerDay,
  countSituations,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  getBgAverage,
} from 'shared/calculations/calculations';
import { setOneDecimal } from 'frontend/utils/helpers';
import styles from './Stats.module.scss';
import { StatLine } from 'frontend/pages/stats/StatLine';

export const Stats = () => {
  const dataState = useReduxState(s => s.data);
  const navigationState = useReduxState(s => s.navigation);
  const actions = useReduxActions();

  const bgModels = getEntriesFeed(dataState);
  const insulins = dataState.timelineModels.filter(is('Insulin'));

  const timeInRange = calculateTimeInRange(bgModels) || '';
  const timeLow = calculateTimeLow(bgModels) || '';
  const timeHigh = calculateTimeHigh(bgModels) || '';
  const hba1c = setOneDecimal(calculateHba1c(bgModels)) || '';
  const totalInsulin = calculateInsulinPerDay(insulins);

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
      <StatLine title="Insulin" subtitle="Units per day" figure={totalInsulin} color={fontColor} />
    </div>
  );
};
