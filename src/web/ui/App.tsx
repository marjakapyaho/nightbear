import { assertExhausted } from 'server/utils/types';
import { ReduxState } from 'web/modules/state';
import 'web/ui/App.scss';
import BgGraphScreen from 'web/ui/screens/BgGraphScreen';
import TimelineDebugScreen from 'web/ui/screens/TimelineDebugScreen';
import MainNavBar from 'web/ui/utils/MainNavBar';
import { useCssNs, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs(module.id);
  const state = useReduxState(s => s.uiNavigation);

  return (
    <div className="this">
      <MainNavBar />
      <div className="screenContainer">{renderSelectedScreen(state.selectedScreen)}</div>
    </div>
  );

  function renderSelectedScreen(selectedScreen: ReduxState['uiNavigation']['selectedScreen']) {
    switch (selectedScreen) {
      case 'TimelineDebugScreen':
        return <TimelineDebugScreen />;
      case 'BgGraphScreen':
        return <BgGraphScreen />;
      default:
        return assertExhausted(selectedScreen);
    }
  }
}) as React.FC<Props>;
