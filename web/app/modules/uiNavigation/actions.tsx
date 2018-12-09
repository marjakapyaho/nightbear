import { UiNavigationState } from 'web/app/modules/uiNavigation/state';
import { actionsWithType } from 'web/app/utils/redux';

export const uiNavigationActions = actionsWithType({
  UI_NAVIGATED: (newScreen: UiNavigationState['selectedScreen']) => ({
    newScreen,
  }),
});
