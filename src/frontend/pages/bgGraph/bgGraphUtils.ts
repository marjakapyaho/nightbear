import { ActiveProfile, Model, SensorEntry, TimelineModel } from 'shared/models/model';
import { NavigationState } from 'frontend/data/navigation/state';
import { ReduxActions } from 'frontend/data/actions';
import { isTimelineModel, lastModel } from 'shared/models/utils';
import { isEqual } from 'lodash';
import { BUCKET_SIZE, performRollingAnalysis } from 'shared/analyser/rolling-analysis';
import { ConfigState } from 'frontend/data/config/state';
import { DataState } from 'frontend/data/data/state';

export const createChangeHandler = <T extends TimelineModel>(
  state: NavigationState,
  actions: ReduxActions,
  modelBeingEdited: Model | null,
  isModelOfCorrectType: (model: unknown) => boolean,
  modelCreateCallback: (timestamp: number, newValue: number) => T,
  modelUpdateCallback: (newValue: number) => Partial<T>,
) => {
  return (newValue: number) => {
    if (isModelOfCorrectType(modelBeingEdited)) {
      // Update an existing Model
      if (!isTimelineModel(modelBeingEdited)) return; // currently, we only support editing of TimelineModel's, even though the type of modelBeingEdited is wider, for call-time convenience
      const updatedModel = { ...modelBeingEdited, ...modelUpdateCallback(newValue) };
      if (isEqual(modelBeingEdited, updatedModel)) {
        actions.MODEL_DELETED_BY_USER(modelBeingEdited); // same value selected again -> clear value -> delete model
      } else {
        actions.MODEL_UPDATED_BY_USER(updatedModel); // perform the update
      }
    } else {
      // Create new Model
      actions.MODEL_UPDATED_BY_USER(
        modelCreateCallback(
          ('timelineCursorAt' in state ? state.timelineCursorAt : null) || // if there's a cursor, place the new Model there
            (isTimelineModel(modelBeingEdited) && modelBeingEdited.timestamp) || // if not, but a Model of another type is selected, place the new Model at the same timestamp
            Date.now(), // if nothing else, create at the current wall clock time
          newValue,
        ),
      );
    }
  };
};

const getAlignedRangeEnd = (bgModels: SensorEntry[], timelineRangeEnd: number) => {
  const latestBgModel = bgModels.find(lastModel);
  return latestBgModel ? latestBgModel.timestamp + BUCKET_SIZE / 2 : timelineRangeEnd;
};

export const getRollingAnalysisResults = (
  configState: ConfigState,
  dataState: DataState,
  navigationState: NavigationState,
  bgModels: SensorEntry[],
  activeProfiles: ActiveProfile[],
  timelineRange: number,
  timelineRangeEnd: number,
) =>
  configState.showRollingAnalysis && dataState.status === 'READY' && navigationState.selectedScreen === 'BgGraph'
    ? performRollingAnalysis(
        (bgModels as Model[]).concat(activeProfiles),
        navigationState.timelineCursorAt ? BUCKET_SIZE : timelineRange, // if there's a cursor placed, run the analysis ONLY at that point in time; this makes debugging the analyser a lot simpler
        navigationState.timelineCursorAt || getAlignedRangeEnd(bgModels, timelineRangeEnd),
      )
    : undefined;
