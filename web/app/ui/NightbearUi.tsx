import { renderFromStore } from 'web/app/utils/react';
import { assertExhausted } from 'web/app/utils/types';
import DebugScreen from 'web/app/ui/screens/DebugScreen';
import DbStatusBar from 'web/app/ui/utils/DbStatusBar';
import BgGraphScreen from 'web/app/ui/screens/BgGraphScreen';
import { actions } from 'web/app/modules/actions';
import LastBgUpdateBar from 'web/app/ui/utils/LastBgUpdateBar';
import DailySummaryScreen from 'web/app/ui/screens/DailySummaryScreen';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, { selectedScreen }, dispatch) => {
    return (
      <div className="this">
        <DbStatusBar />
        <LastBgUpdateBar />
        {renderScreenSelector()}
        {renderSelectedScreen()}
      </div>
    );

    function renderScreenSelector() {
      return (
        <select
          onChange={event => dispatch(actions.UI_NAVIGATED(event.target.value as any))}
          value={selectedScreen}
        >
          <option key="BgGraphScreen" value="BgGraphScreen">
            BgGraphScreen
          </option>
          <option key="DebugScreen" value="DebugScreen">
            DebugScreen
          </option>
          <option key="DailySummaryScreen" value="DailySummaryScreen">
            DailySummaryScreen
          </option>
        </select>
      );
    }

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
