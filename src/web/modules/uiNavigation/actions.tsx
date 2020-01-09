import { SavedProfile, TimelineModel } from 'core/models/model';
import { UiNavigationState } from 'web/modules/uiNavigation/state';
import { actionsWithType } from 'web/utils/redux';

export const uiNavigationActions = actionsWithType({
  UI_NAVIGATED: (newScreen: UiNavigationState['selectedScreen']) => ({
    newScreen,
  }),
  MODEL_SELECTED_FOR_EDITING: (model: TimelineModel | null) => ({ model }),
  MODEL_CHANGES_SAVED: (model: TimelineModel) => ({ model }),
  TIMELINE_CURSOR_UPDATED: (timestamp: number | null) => ({ timestamp }),
  PROFILE_ACTIVATED: (profile: SavedProfile, atTimestamp: number) => ({ profile, atTimestamp }),
});
