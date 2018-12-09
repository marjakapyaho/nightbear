import { ReduxAction } from 'web/app/modules/actions';
import { ReduxState } from 'web/app/modules/state';
import { uiNavigationInitState, UiNavigationState } from 'web/app/modules/uiNavigation/state';

export function uiNavigationReducer(
  state: UiNavigationState = uiNavigationInitState,
  action: ReduxAction,
  _rootState: ReduxState,
): UiNavigationState {
  switch (action.type) {
    case 'UI_NAVIGATED':
      return { ...state, selectedScreen: action.newScreen };
    default:
      return state;
  }
}
