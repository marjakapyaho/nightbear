import React, { useEffect } from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { pagePadding, reallyHighLimit, reallyLowLimit } from 'web/utils/config';
import { css } from '@emotion/css';
import { borderColorLight, fontColorExtraLight, nbGood, nbHigh, nbLow, fontColor } from 'web/utils/colors';
import { is } from 'core/models/utils';
import {
  calculateHba1c,
  calculateInsulinPerDay,
  countSituations,
  calculateTimeHigh,
  calculateTimeInRange,
  calculateTimeLow,
  getBgAverage,
} from 'core/calculations/calculations';
import { setOneDecimal } from 'web/utils/helpers';

type Props = {};

const styles = {
  stat: css({
    background: 'whitesmoke',
    borderRadius: '100%',
    width: 90,
    height: 90,
    textAlign: 'center',
    paddingTop: 14,
    fontSize: 8,
    textTransform: 'uppercase',
    color: 'white',
  }),
  statStrong: css({
    display: 'block',
    marginTop: 10,
    fontSize: 24,
    textTransform: 'none',
  }),
};

function statLine(title: string, subtitle: string, figure: number | string, color: string = fontColor) {
  return (
    <div
      style={{
        padding: pagePadding,
        borderBottom: `8px solid ${borderColorLight}`,
        alignItems: 'center',
        display: 'flex',
      }}
    >
      <div>
        <span
          style={{
            display: 'block',
            fontSize: '18px',
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: '10px',
            color: fontColorExtraLight,
          }}
        >
          {subtitle}
        </span>
      </div>
      <span
        style={{
          fontSize: 50,
          marginLeft: 25,
          marginRight: 50,
          color: color,
        }}
      >
        {figure}
      </span>
    </div>
  );
}

export default (() => {
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
    actions.UI_NAVIGATED('StatsScreen');
    // eslint-disable-next-line
  }, []);

  if (navigationState.selectedScreen !== 'StatsScreen') return null;

  return (
    <div
      style={{
        overflowY: 'scroll',
      }}
    >
      <div
        style={{
          padding: pagePadding,
          display: 'flex',
        }}
      >
        <div
          className={styles.stat}
          style={{
            background: nbGood,
            marginRight: 21,
          }}
        >
          Good <strong className={styles.statStrong}>{timeInRange}%</strong>
        </div>
        <div
          className={styles.stat}
          style={{
            background: nbLow,
            marginRight: 21,
          }}
        >
          Low <strong className={styles.statStrong}>{timeLow}%</strong>
        </div>
        <div
          className={styles.stat}
          style={{
            background: nbHigh,
          }}
        >
          High <strong className={styles.statStrong}>{timeHigh}%</strong>
        </div>
      </div>

      {statLine('Avg BG', 'for 7 days', getBgAverage(bgModels), nbGood)}
      {statLine('Hba1c', 'for 7 days', hba1c, nbGood)}
      {statLine('LOW', 'below 3.7', countSituations(bgModels, 3.7, true), nbLow)}
      {statLine('LOW', 'below 3.0', countSituations(bgModels, reallyLowLimit, true), nbLow)}
      {statLine('HIGH', `over ${reallyHighLimit}`, countSituations(bgModels, reallyHighLimit, false), nbHigh)}
      {statLine('Insulin', 'Units per day', totalInsulin)}
    </div>
  );
}) as React.FC<Props>;
