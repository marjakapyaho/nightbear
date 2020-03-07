import { Model } from 'core/models/model';
import { DataState } from 'web/modules/data/state';

// Finds the Model (if any!) from the State, by its UUID.
// For convenience, allow passing in null as well.
// TODO: If this ends up being a hot path, let's keep a WeakMap<string, Model> around.
export function getModelByUuid(state: DataState, modelUuid: string | null): Model | null {
  return (
    (state.status === 'READY' &&
      modelUuid !== null &&
      (_getModelByUuid(state.timelineModels, modelUuid) || // either the Model is found here...
        _getModelByUuid(state.globalModels, modelUuid))) || // ...or here
    null // ...or not at all!
  );
}

function _getModelByUuid(candidates: Model[], modelUuid: string): Model | null {
  return candidates.find(m => m.modelUuid === modelUuid) || null;
}
