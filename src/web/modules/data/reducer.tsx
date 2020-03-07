import { Model } from 'core/models/model';
import { isSameModel, isTimelineModel } from 'core/models/utils';
import { reviveCouchDbRowIntoModel } from 'core/storage/couchDbStorage';
import { actions, ReduxAction } from 'web/modules/actions';
import { ReduxState } from 'web/modules/state';
import { dataInitState, DataState } from 'web/modules/data/state';

export function dataReducer(state: DataState = dataInitState, action: ReduxAction, _rootState: ReduxState): DataState {
  switch (action.type) {
    case actions.TIMELINE_DATA_UPDATED.type:
      const timelineModels = mergeIncomingModels(state.timelineModels, action.timelineModels);
      const globalModels = mergeIncomingModels(state.globalModels, action.globalModels);
      return {
        ...state,
        status: 'READY', // TODO: Don't overwrite previous error status if it exists..?
        timelineModels,
        globalModels,
      };
    case actions.TIMELINE_DATA_DELETED.type:
      return {
        ...state,
        timelineModels: removeDeletedModels(state.timelineModels, action.deletedModels),
        globalModels: removeDeletedModels(state.globalModels, action.deletedModels),
      };
    case actions.TIMELINE_DATA_FAILED.type:
      return {
        ...state,
        status: 'ERROR',
        errorMessage: action.err.message,
      };
    case actions.MODEL_UPDATED_BY_USER.type:
      return {
        ...state,
        timelineModels: mergeIncomingModels(state.timelineModels, [action.model]), // also to get a realistic re-render quicker, let's immediately merge the new Model in, even if the DB would soon emit it anyway
      };
    case actions.MODEL_DELETED_BY_USER.type:
      return {
        ...state,
        timelineModels: removeDeletedModels(state.timelineModels, [action.model]), // also to get a realistic re-render quicker, let's immediately remove the Model, even if the DB would soon emit it anyway
      };
    case actions.DB_EMITTED_CHANGES.type:
      try {
        const newModels = action.changes.map(change => reviveCouchDbRowIntoModel(change.doc));
        console.log('Got new models', newModels);
        return {
          ...state,
          timelineModels: state.timelineModels.map(existingModel => {
            const replacement = newModels.find(isSameModel.bind(null, existingModel));
            if (replacement && isTimelineModel(replacement)) {
              console.log('Found replacement:', replacement);
              return replacement;
            } else {
              return existingModel;
            }
          }),
        };
      } catch (err) {
        console.log(`Couldn't revive changed docs into models`, action.changes);
      }
      return state;
    default:
      return state;
  }
}

// Updates an array of existing Models, so that incoming Models either replace existing ones with the same storageKey, or are simply appended if they're new
function mergeIncomingModels<T extends Model>(existingModels: T[], incomingModels: T[]): T[] {
  const map = new Map<string, T>();
  ([] as T[])
    .concat(existingModels)
    .concat(incomingModels)
    .forEach(m => {
      map.set(m.modelUuid, m);
    });
  return [...map.values()];
}

// Updates an array of existing Models, so that the given ones are removed from it
function removeDeletedModels<T extends Model>(existingModels: T[], modelsToDelete: Model[]): T[] {
  return existingModels.filter(existingModel => !modelsToDelete.find(isSameModel.bind(null, existingModel)));
}
