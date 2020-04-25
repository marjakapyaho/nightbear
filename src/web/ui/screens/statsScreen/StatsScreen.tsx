import React from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';
import { useReduxState } from 'web/utils/react';
import { SensorEntry } from 'core/models/model';
import { highLimit, lowLimit } from 'web/utils/config';
import { css } from 'emotion';
import { nbGood, nbHigh, nbLow } from 'web/utils/colors';

type Props = {};

const styles = {
  stat: css({
    marginBottom: 10,
  }),
};

export default (() => {
  const dataState = useReduxState(s => s.data);
  const bgModels = getEntriesFeed(dataState);
  const timeInRange = calculateTimeInRange(bgModels);
  const timeLow = calculateTimeLow(bgModels);
  const timeHigh = calculateTimeHigh(bgModels);

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <div className={styles.stat}>
        Time in range:{' '}
        <strong
          style={{
            color: nbGood,
          }}
        >
          {timeInRange}%
        </strong>
      </div>
      <div className={styles.stat}>
        Time low:{' '}
        <strong
          style={{
            color: nbLow,
          }}
        >
          {timeLow}%
        </strong>
      </div>
      <div className={styles.stat}>
        Time high:{' '}
        <strong
          style={{
            color: nbHigh,
          }}
        >
          {timeHigh}%
        </strong>
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
