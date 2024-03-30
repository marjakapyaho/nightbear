import { lastModel } from 'shared/models/utils';
import React from 'react';
import { getEntriesFeed } from 'frontend/data/data/getters';
import { TimeAgo } from 'frontend/components/timeAgo/TimeAgo';
import { fontColorDark } from 'frontend/utils/colors';
import { fontSize } from 'frontend/utils/config';
import { useReduxState } from 'frontend/utils/react';
import styles from './StatusBar.module.scss';

export const StatusBar = () => {
  const dataState = useReduxState(s => s.data);
  const bgModels = getEntriesFeed(dataState);
  const latestBgModel = bgModels.find(lastModel);

  return (
    <div className={styles.statusBar}>
      <div className={styles.status}>
        <span style={{ color: fontColorDark, fontSize: fontSize }}>
          {latestBgModel ? <TimeAgo ts={latestBgModel.timestamp} decimalsForMinutes frequentUpdates /> : 'n/a'}
        </span>{' '}
        ago
      </div>
    </div>
  );
};
