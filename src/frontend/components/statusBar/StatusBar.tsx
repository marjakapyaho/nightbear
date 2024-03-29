import { lastModel } from 'shared/models/utils';
import React from 'react';
import { getEntriesFeed } from 'frontend/data/data/getters';
import TimeAgo from 'frontend/components/timeAgo/TimeAgo';
import { fontColorDark, fontColorLight } from 'frontend/utils/colors';
import { fontSize, fontSizeExtraSmall } from 'frontend/utils/config';
import { useReduxState } from 'frontend/utils/react';

type Props = {};

export default (props => {
  const dataState = useReduxState(s => s.data);
  const bgModels = getEntriesFeed(dataState);
  const latestBgModel = bgModels.find(lastModel);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: 30,
      }}
    >
      <div
        style={{
          padding: '7px 12px',
          color: fontColorLight,
          fontSize: fontSizeExtraSmall,
          flex: 1,
        }}
      >
        <span style={{ color: fontColorDark, fontSize: fontSize }}>
          {latestBgModel ? <TimeAgo ts={latestBgModel.timestamp} decimalsForMinutes frequentUpdates /> : 'n/a'}
        </span>{' '}
        ago
      </div>
    </div>
  );
}) as React.FC<Props>;
