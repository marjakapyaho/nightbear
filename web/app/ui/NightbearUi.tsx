import { renderFromStore } from 'web/app/utils/react';
import { assertExhausted } from 'web/app/utils/types';
import DebugScreen from 'web/app/ui/screens/DebugScreen';
import DbStatusBar from 'web/app/ui/utils/DbStatusBar';
import BgGraphScreen from 'web/app/ui/screens/BgGraphScreen';
import { actions } from 'web/app/modules/actions';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, { selectedScreen }, dispatch) => {
    return (
      <div className="this">
        <DbStatusBar />
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
        </select>
      );
    }

    function renderSelectedScreen() {
      switch (selectedScreen) {
        case 'DebugScreen':
          return <DebugScreen />;
        case 'BgGraphScreen':
          return <BgGraphScreen />;
        default:
          return assertExhausted(selectedScreen);
      }
    }
  },
);
