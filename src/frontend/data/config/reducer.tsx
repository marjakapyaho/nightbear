import { ReduxAction, actions } from 'frontend/data/actions';
import { configInitState, ConfigState } from 'frontend/data/config/state';
import { ReduxState } from 'frontend/data/state';

export function configReducer(
  state: ConfigState = configInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): ConfigState {
  switch (action.type) {
    case actions.CONFIG_UPDATED.type:
      return { ...state, ...action.newConfig };
    case actions.ROLLING_ANALYSIS_TOGGLED.type:
      return { ...state, showRollingAnalysis: !state.showRollingAnalysis };
    case actions.AUTO_REFRESH_TOGGLED.type:
      return { ...state, autoRefreshData: !state.autoRefreshData };
    case actions.ZOOMED_IN_TIMELINE_TOGGLED.type:
      return { ...state, zoomedInTimeline: !state.zoomedInTimeline };
    case actions.ACK_LATEST_ALARM_SUCCEEDED.type:
      return { ...state, ackLatestAlarmSucceededAt: Date.now() };
    default:
      return state;
  }
}
