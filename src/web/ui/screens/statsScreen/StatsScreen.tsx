import React, { useEffect } from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { SensorEntry } from 'core/models/model';
import { highLimit, lowLimit, pagePadding } from 'web/utils/config';
import { css } from 'emotion';
import { nbGood, nbHigh, nbLow } from 'web/utils/colors';

type Props = {};

const styles = {
  stat: css({
    marginRight: 15,
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

export default (() => {
  const dataState = useReduxState(s => s.data);
  const navigationState = useReduxState(s => s.navigation);
  const actions = useReduxActions();
  const bgModels = getEntriesFeed(dataState);
  const timeInRange = calculateTimeInRange(bgModels) || '';
  const timeLow = calculateTimeLow(bgModels) || '';
  const timeHigh = calculateTimeHigh(bgModels) || '';

  useEffect(() => {
    actions.UI_NAVIGATED('StatsScreen');
  }, [actions]);

  if (navigationState.selectedScreen !== 'StatsScreen') return null;

  return (
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
        }}
      >
        Good <strong className={styles.statStrong}>{timeInRange}%</strong>
      </div>
      <div
        className={styles.stat}
        style={{
          background: nbLow,
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
  );
}) as React.FC<Props>;

function calculateTimeInRange(bgModels: SensorEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(
    model => model.bloodGlucose && model.bloodGlucose >= lowLimit && model.bloodGlucose <= highLimit,
  ).length;

  return Math.round((goodCount / totalCount) * 100);
}

function calculateTimeLow(bgModels: SensorEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(model => model.bloodGlucose && model.bloodGlucose < lowLimit).length;

  return Math.round((goodCount / totalCount) * 100);
}

function calculateTimeHigh(bgModels: SensorEntry[]) {
  const totalCount = bgModels.length;
  const goodCount = bgModels.filter(model => model.bloodGlucose && model.bloodGlucose > highLimit).length;

  return Math.round((goodCount / totalCount) * 100);
}
