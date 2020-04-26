import React, { useEffect } from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';
import { useReduxActions, useReduxState } from 'web/utils/react';
import { SensorEntry } from 'core/models/model';
import { highLimit, lowLimit, pagePadding } from 'web/utils/config';
import { css } from 'emotion';
import { borderColorLight, fontColorExtraLight, nbGood, nbHigh, nbLow } from 'web/utils/colors';
import { calculateHba1c } from 'core/calculations/calculations';
import { set2Decimals } from 'web/utils/helpers';

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
    // eslint-disable-next-line
  }, []);

  if (navigationState.selectedScreen !== 'StatsScreen') return null;

  return (
    <>
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

      <div
        style={{
          padding: pagePadding,
          borderTop: `8px solid ${borderColorLight}`,
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
            Hba1c
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              color: fontColorExtraLight,
            }}
          >
            for 7 days
          </span>
        </div>
        <span
          style={{
            fontSize: 50,
            marginLeft: 25,
            color: nbGood,
          }}
        >
          {getHba1cValue(bgModels)}
        </span>
      </div>

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
            LOW
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              color: fontColorExtraLight,
            }}
          >
            below 3.7
          </span>
        </div>
        <span
          style={{
            fontSize: 50,
            marginLeft: 25,
            marginRight: 50,
            color: nbLow,
          }}
        >
          {calculateOccuranceOfLows(bgModels, 3.7)}
        </span>

        <div>
          <span
            style={{
              display: 'block',
              fontSize: '18px',
            }}
          >
            LOW
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              color: fontColorExtraLight,
            }}
          >
            below 3.0
          </span>
        </div>
        <span
          style={{
            fontSize: 50,
            marginLeft: 25,
            color: nbLow,
          }}
        >
          {calculateOccuranceOfLows(bgModels, 3)}
        </span>
      </div>
    </>
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

function getHba1cValue(bgModels: SensorEntry[]) {
  return set2Decimals(calculateHba1c(bgModels)) || '';
}

function calculateOccuranceOfLows(bgModels: SensorEntry[], limit: number) {
  let counter = 0;
  let lowBeingRecorded: boolean;

  bgModels.forEach(model => {
    if (model.bloodGlucose && model.bloodGlucose < limit) {
      if (!lowBeingRecorded) {
        counter++;
        lowBeingRecorded = true;
      }
    } else {
      lowBeingRecorded = false;
    }
  });

  return counter;
}
