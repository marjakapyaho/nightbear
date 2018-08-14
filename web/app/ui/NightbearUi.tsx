import { renderFromStore } from 'web/app/utils/react';
import { assertExhausted } from 'web/app/utils/types';
import DebugScreen from 'web/app/ui/screens/DebugScreen';
import BgGraphScreen from 'web/app/ui/screens/BgGraphScreen';
import DailySummaryScreen from 'web/app/ui/screens/DailySummaryScreen';
import MainNavBar from 'web/app/ui/utils/MainNavBar';

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
