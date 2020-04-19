import 'web/ui/components/mainNavBar/MainNavBar.scss';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { is, lastModel } from 'core/models/utils';
import { mergeEntriesFeed } from 'core/entries/entries';
import { fontColor, fontColorDark, fontColorLight } from 'web/utils/colors';
import { fontSize, fontSizeExtraSmall } from 'web/utils/config';
import { Checkbox } from 'pretty-checkbox-react';

type Props = {};

export default (props => {
  const { React } = useCssNs('MainNavBar');
  const dataState = useReduxState(s => s.data);
  const configState = useReduxState(s => s.config);
  const actions = useReduxActions();

  const checkboxStyles = { display: 'block', marginBottom: 20, color: fontColor, fontSize: fontSize };

  const bgModels = mergeEntriesFeed([
    dataState.timelineModels.filter(is('DexcomG6ShareEntry')),
    dataState.timelineModels.filter(is('DexcomG6SensorEntry')),
    dataState.timelineModels.filter(is('DexcomSensorEntry')),
    dataState.timelineModels.filter(is('DexcomRawSensorEntry')),
    dataState.timelineModels.filter(is('ParakeetSensorEntry')),
    dataState.timelineModels.filter(is('MeterEntry')),
  ]);

  const latestBgModel = bgModels.find(lastModel);

  return (
    <div className="this">
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
