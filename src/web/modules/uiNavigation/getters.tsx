import { UiNavigationState } from 'web/modules/uiNavigation/state';
import { Model } from 'core/models/model';

// Finds the Model (if any!) from the State, by its UUID.
// For convenience, allow passing in null as well.
// TODO: If this ends up being a hot path, let's keep a WeakMap<string, Model> around.
export function getModelByUuid(state: UiNavigationState, modelUuid: string | null): Model | null {
  if (!('loadedModels' in state)) return null;
  return (
    (state.loadedModels.status === 'READY' &&
      modelUuid !== null &&
      (_getModelByUuid(state.loadedModels.timelineModels, modelUuid) ||
        _getModelByUuid(state.loadedModels.globalModels, modelUuid))) ||
    null
  );
}

function _getModelByUuid(candidates: Model[], modelUuid: string): Model | null {
  return candidates.find(m => m.modelUuid === modelUuid) || null;
}
