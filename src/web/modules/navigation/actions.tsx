import { SavedProfile, TimelineModel } from 'core/models/model';
import { NavigationState } from 'web/modules/navigation/state';
import { actionsWithType } from 'web/utils/redux';

export const navigationActions = actionsWithType({
  UI_NAVIGATED: (newScreen: NavigationState['selectedScreen']) => ({
    newScreen,
  }),
  MODEL_SELECTED_FOR_EDITING: (model: TimelineModel | null) => ({ model }),
  TIMELINE_CURSOR_UPDATED: (timestamp: number | null) => ({ timestamp }),
  PROFILE_ACTIVATED: (profile: SavedProfile, atTimestamp: number) => ({ profile, atTimestamp }),
});
