import { assertExhausted } from 'server/utils/types';
import { ReduxState } from 'web/modules/state';
import 'web/ui/App.scss';
import MainNavBar from 'web/ui/components/mainNavBar/MainNavBar';
import BgGraphScreen from 'web/ui/screens/bgGraphScreen/BgGraphScreen';
import ConfigScreen from 'web/ui/screens/configScreen/ConfigScreen';
import TimelineDebugScreen from 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen';
import { useCssNs, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('App');
  const navigationState = useReduxState(s => s.navigation);

  return (
    <div className="this">
      <MainNavBar />
      <div className="screenContainer">{renderSelectedScreen(navigationState.selectedScreen)}</div>
    </div>
  );

  function renderSelectedScreen(selectedScreen: ReduxState['navigation']['selectedScreen']) {
    switch (selectedScreen) {
      case 'TimelineDebugScreen':
        return <TimelineDebugScreen />;
      case 'BgGraphScreen':
        return <BgGraphScreen />;
      case 'ConfigScreen':
        return <ConfigScreen />;
      default:
        return assertExhausted(selectedScreen);
    }
  }
}) as React.FC<Props>;
