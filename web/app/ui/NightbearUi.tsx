import { assertExhausted } from 'server/utils/types';
import BgGraphScreen from 'web/app/ui/screens/BgGraphScreen';
import DailySummaryScreen from 'web/app/ui/screens/DailySummaryScreen';
import DebugScreen from 'web/app/ui/screens/DebugScreen';
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
        case 'DebugScreen':
          return <DebugScreen />;
        case 'TimelineDebugScreen':
          return <TimelineDebugScreen />;
        case 'BgGraphScreen':
          return <BgGraphScreen />;
        case 'DailySummaryScreen':
          return <DailySummaryScreen />;
        default:
          return assertExhausted(selectedScreen);
      }
    }
  },
);
