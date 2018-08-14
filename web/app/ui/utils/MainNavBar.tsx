import { renderFromStore } from 'web/app/utils/react';
import { UiNavigationState } from 'web/app/modules/uiNavigation/state';
import { actions } from 'web/app/modules/actions';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, state, dispatch) => {
    return (
      <div className="this">
        {renderTab('BgGraphScreen', 'Log')}
        {renderTab('DailySummaryScreen', 'Summary')}
        {renderTab('DebugScreen', 'Debug')}
      </div>
    );

    function renderTab(screen: UiNavigationState['selectedScreen'], title: string) {
      return (
        <button
          className={screen === state.selectedScreen ? 'selected' : undefined}
          onClick={() => dispatch(actions.UI_NAVIGATED(screen))}
        >
          {title}
        </button>
      );
    }
  },
);
