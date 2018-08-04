import { renderFromStore } from 'web/app/utils/react';
import { assertExhausted } from 'web/app/utils/types';
import DebugScreen from 'web/app/ui/screens/DebugScreen';
import DbStatusBar from 'web/app/ui/utils/DbStatusBar';

export default renderFromStore(
  __filename,
  state => state.configVars,
  (React, { selectedScreen }) => {
    return (
      <div className="this">
        <DbStatusBar />
        {renderSelectedScreen()}
      </div>
    );

    function renderSelectedScreen() {
      switch (selectedScreen) {
        case 'DebugScreen':
          return <DebugScreen />;
        default:
          return assertExhausted(selectedScreen);
      }
    }
  },
);
