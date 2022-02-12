import { lastModel } from 'core/models/utils';
import React from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { fontColorDark, fontColorLight } from 'web/utils/colors';
import { fontSize, fontSizeExtraSmall } from 'web/utils/config';
import { useReduxState } from 'web/utils/react';

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
