import { NavigationState } from 'web/modules/navigation/state';
import 'web/ui/components/mainNavBar/MainNavBar.scss';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('MainNavBar');
  const selectedScreen = useReduxState(s => s.navigation.selectedScreen);
  const { UI_NAVIGATED } = useReduxActions();

  return (
    <div className="this">
      {renderTab('BgGraphScreen', 'Log')}
      {renderTab('SettingsScreen', 'Settings')}
      {renderTab('TimelineDebugScreen', 'Debug')}
    </div>
  );

  function renderTab(screen: NavigationState['selectedScreen'], title: string) {
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
