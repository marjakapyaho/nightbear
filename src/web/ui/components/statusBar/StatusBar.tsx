import { useReduxActions, useReduxState } from 'web/utils/react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { lastModel } from 'core/models/utils';
import { fontColor, fontColorDark, fontColorLight } from 'web/utils/colors';
import { fontSize, fontSizeExtraSmall } from 'web/utils/config';
import { Checkbox } from 'pretty-checkbox-react';
import React from 'react';
import { getEntriesFeed } from 'web/modules/data/getters';

type Props = {};

export default (props => {
  const dataState = useReduxState(s => s.data);
  const configState = useReduxState(s => s.config);
  const actions = useReduxActions();
  const checkboxStyles = { display: 'block', marginBottom: 20, color: fontColor, fontSize: fontSize };
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
      <div
        style={{
          padding: '7px 0',
        }}
      >
        <Checkbox
          style={checkboxStyles}
          className="p-curve"
          state={configState.showRollingAnalysis}
          onChange={actions.ROLLING_ANALYSIS_TOGGLED}
        >
          Show analysis
        </Checkbox>
      </div>
    </div>
  );
}) as React.FC<Props>;
