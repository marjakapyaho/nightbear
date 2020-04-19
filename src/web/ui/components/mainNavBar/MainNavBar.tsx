import 'web/ui/components/mainNavBar/MainNavBar.scss';
import { useCssNs, useReduxState } from 'web/utils/react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { is, lastModel } from 'core/models/utils';
import { mergeEntriesFeed } from 'core/entries/entries';
import { fontColorDark, fontColorLight } from 'web/utils/colors';
import { fontSize, fontSizeExtraSmall } from 'web/utils/config';

type Props = {};

export default (props => {
  const { React } = useCssNs('MainNavBar');
  const dataState = useReduxState(s => s.data);

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
          padding: 7,
          color: fontColorLight,
          fontSize: fontSizeExtraSmall,
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
