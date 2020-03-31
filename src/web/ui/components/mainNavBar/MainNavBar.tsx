import { NavigationState } from 'web/modules/navigation/state';
import 'web/ui/components/mainNavBar/MainNavBar.scss';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';
import TimeAgo from 'web/ui/components/timeAgo/TimeAgo';
import { is, last } from 'core/models/utils';
import { mergeEntriesFeed } from 'core/entries/entries';

type Props = {};

export default (props => {
  const { React } = useCssNs('MainNavBar');
  const selectedScreen = useReduxState(s => s.navigation.selectedScreen);
  const { UI_NAVIGATED } = useReduxActions();
  const dataState = useReduxState(s => s.data);

  const bgModels = mergeEntriesFeed([
    dataState.timelineModels.filter(is('DexcomG6SensorEntry')),
    dataState.timelineModels.filter(is('DexcomSensorEntry')),
    dataState.timelineModels.filter(is('DexcomRawSensorEntry')),
    dataState.timelineModels.filter(is('ParakeetSensorEntry')),
    dataState.timelineModels.filter(is('MeterEntry')),
  ]);

  const latestBgModel = bgModels.find(last);

  return (
    <div className="this">
      {renderTab('BgGraphScreen', 'Log')}
      {renderTab('ConfigScreen', 'Config')}
      {renderTab('TimelineDebugScreen', 'Debug')}
    </div>
  );

  function renderTab(screen: NavigationState['selectedScreen'], title: string) {
    return (
      <button
        className={`button ${screen === selectedScreen ? 'button-selected' : ''}`}
        onClick={() => UI_NAVIGATED(screen)}
      >
        {title}

        {screen === 'BgGraphScreen' && (
          <span
            style={{
              textTransform: 'none',
              marginLeft: 10,
              paddingLeft: 10,
              borderLeft: '1px solid #bbb',
              color: '#ddd',
            }}
          >
            {latestBgModel ? <TimeAgo ts={latestBgModel.timestamp} decimalsForMinutes frequentUpdates /> : 'n/a'}
          </span>
        )}
      </button>
    );
  }
}) as React.FC<Props>;
