import { assertExhausted } from 'server/utils/types';
import BgGraphScreen from 'web/app/ui/screens/BgGraphScreen';
import TimelineDebugScreen from 'web/app/ui/screens/TimelineDebugScreen';
import MainNavBar from 'web/app/ui/utils/MainNavBar';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, { selectedScreen }) => {
    return (
      <div className="this">
        <MainNavBar />
        <div className="screen">{renderSelectedScreen()}</div>
      </div>
    );

    function renderSelectedScreen() {
      switch (selectedScreen) {
        case 'TimelineDebugScreen':
          return <TimelineDebugScreen />;
        case 'BgGraphScreen':
          return <BgGraphScreen />;
        default:
          return assertExhausted(selectedScreen);
      }
    }
  },
);
