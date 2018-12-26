import { actions } from 'web/app/modules/actions';
import { UiNavigationState } from 'web/app/modules/uiNavigation/state';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, state, dispatch) => {
    return (
      <div className="this">
        {renderTab('BgGraphScreen', 'Log')}
        {renderTab('TimelineDebugScreen', 'Debug')}
      </div>
    );

    function renderTab(screen: UiNavigationState['selectedScreen'], title: string) {
      return (
        <button
          className={`button ${screen === state.selectedScreen ? 'button-selected' : ''}`}
          onClick={() => dispatch(actions.UI_NAVIGATED(screen))}
        >
          {title}
        </button>
      );
    }
  },
);
