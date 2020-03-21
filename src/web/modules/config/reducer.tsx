import { ReduxAction, actions } from 'web/modules/actions';
import { configInitState, ConfigState } from 'web/modules/config/state';
import { ReduxState } from 'web/modules/state';

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
    default:
      return state;
  }
}
