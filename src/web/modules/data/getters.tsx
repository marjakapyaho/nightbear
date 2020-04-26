import { Model } from 'core/models/model';
import { DataState } from 'web/modules/data/state';
import { mergeEntriesFeed } from 'core/entries/entries';
import { is } from 'core/models/utils';

export function getEntriesFeed(state: DataState) {
  return mergeEntriesFeed([
    state.timelineModels.filter(is('DexcomG6ShareEntry')),
    state.timelineModels.filter(is('DexcomG6SensorEntry')),
    state.timelineModels.filter(is('DexcomSensorEntry')),
    state.timelineModels.filter(is('DexcomRawSensorEntry')),
    state.timelineModels.filter(is('ParakeetSensorEntry')),
    state.timelineModels.filter(is('MeterEntry')),
  ]);
}

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
