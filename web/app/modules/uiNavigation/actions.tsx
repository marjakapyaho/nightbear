import { actionsWithType } from 'web/app/utils/redux';
import { UiNavigationState } from 'web/app/modules/uiNavigation/state';

export const uiNavigationActions = actionsWithType({
  UI_NAVIGATED: (newScreen: UiNavigationState['selectedScreen']) => ({
    newScreen,
  }),
});
