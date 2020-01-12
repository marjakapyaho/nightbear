import { UiNavigationState } from 'web/modules/uiNavigation/state';
import 'web/ui/utils/MainNavBar.scss';
import { useCssNs, useReduxDispatch, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('MainNavBar');
  const selectedScreen = useReduxState(s => s.uiNavigation.selectedScreen);
  const { UI_NAVIGATED } = useReduxDispatch();

  return (
    <div className="this">
      {renderTab('BgGraphScreen', 'Log')}
      {renderTab('TimelineDebugScreen', 'Debug')}
    </div>
  );

  function renderTab(screen: UiNavigationState['selectedScreen'], title: string) {
    return (
      <button
        className={`button ${screen === selectedScreen ? 'button-selected' : ''}`}
        onClick={() => UI_NAVIGATED(screen)}
      >
        {title}
      </button>
    );
  }
}) as React.FC<Props>;
