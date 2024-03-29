import { performRollingAnalysis, BUCKET_SIZE } from 'shared/analyser/rolling-analysis';
import { Model, TimelineModel } from 'shared/models/model';
import { is, isTimelineModel, lastModel } from 'shared/models/utils';
import { generateUuid } from 'shared/utils/id';
import { isEqual } from 'lodash';
import { ReduxActions } from 'frontend/data/actions';
import { getEntriesFeed, getModelByUuid } from 'frontend/data/data/getters';
import { NavigationState } from 'frontend/data/navigation/state';
import ScrollNumberSelector from 'frontend/components/scrollNumberSelector/ScrollNumberSelector';
import Timeline from 'frontend/components/timeline/Timeline';
import 'frontend/pages/bgGraphScreen/BgGraphScreen.scss';
import { useReduxActions, useReduxState } from 'frontend/utils/react';
import { nbBg, nbCarbs, nbInsulin } from 'frontend/utils/colors';
import StatusBar from 'frontend/components/statusBar/StatusBar';
import { useEffect } from 'react';
import React from 'react';

type Props = {};

export default (() => {
  const configState = useReduxState(s => s.config);
  const navigationState = useReduxState(s => s.navigation);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  useEffect(() => {
    actions.UI_NAVIGATED('BgGraphScreen');
    // eslint-disable-next-line
  }, []);

  if (navigationState.selectedScreen !== 'BgGraphScreen') return null; // this screen can only be rendered if it's been selected in state

  const { timelineRange, timelineRangeEnd } = navigationState;
  const modelBeingEdited = getModelByUuid(dataState, navigationState.modelUuidBeingEdited);
  const bgModels = getEntriesFeed(dataState);
  const activeProfiles = dataState.timelineModels.filter(is('ActiveProfile'));
  const getAlignedRangeEnd = () => {
    const latestBgModel = bgModels.find(lastModel);
    return latestBgModel ? latestBgModel.timestamp + BUCKET_SIZE / 2 : timelineRangeEnd;
  };
  const rollingAnalysisResults =
    configState.showRollingAnalysis && dataState.status === 'READY'
      ? performRollingAnalysis(
          (bgModels as Model[]).concat(activeProfiles),
          navigationState.timelineCursorAt ? BUCKET_SIZE : timelineRange, // if there's a cursor placed, run the analysis ONLY at that point in time; this makes debugging the analyser a lot simpler
          navigationState.timelineCursorAt || getAlignedRangeEnd(),
        )
      : undefined;
  const timelineConfig = {
    timelineRange,
    timelineRangeEnd,
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 30,
    outerHeight: 330,
    bgMin: 2,
    bgMax: 22,
    bgStep: 1,
    pixelsPerHour: configState.zoomedInTimeline ? 350 : 100,
  };

  console.debug('Active profile', activeProfiles.find(lastModel));
  if (navigationState.timelineCursorAt) {
    console.debug('Timeline cursor', [new Date(navigationState.timelineCursorAt).toISOString()]);
  }

  return (
    <div className="nb-BgGraphScreen">
      <StatusBar />
      <div className="nb-BgGraphScreen-top" style={{ height: timelineConfig.outerHeight }}>
        {dataState.status === 'READY' && (
          <Timeline
            timelineConfig={timelineConfig}
            cursorTimestamp={navigationState.timelineCursorAt}
            onCursorTimestampUpdate={actions.TIMELINE_CURSOR_UPDATED}
            bgModels={bgModels}
            selectedBgModel={is('MeterEntry')(modelBeingEdited) ? modelBeingEdited : undefined}
            onBgModelSelect={model => (is('MeterEntry')(model) ? actions.MODEL_SELECTED_FOR_EDITING(model) : undefined)} // currently, of all the BG types, we only support editing MeterEntry's, because editing the other ones wouldn't make much sense
            insulinModels={dataState.timelineModels.filter(is('Insulin'))}
            selectedInsulinModel={is('Insulin')(modelBeingEdited) ? modelBeingEdited : undefined}
            onInsulinModelSelect={actions.MODEL_SELECTED_FOR_EDITING}
            carbsModels={dataState.timelineModels.filter(is('Carbs'))}
            selectedCarbsModel={is('Carbs')(modelBeingEdited) ? modelBeingEdited : undefined}
            onCarbsModelSelect={actions.MODEL_SELECTED_FOR_EDITING}
            profileModels={activeProfiles}
            rollingAnalysisResults={rollingAnalysisResults}
          />
        )}
        {dataState.status === 'FETCHING' && <pre>Loading...</pre>}
        {dataState.status === 'ERROR' && <pre>Error: {dataState.errorMessage}</pre>}
      </div>
      <div className="nb-BgGraphScreen-bottom">
        <ScrollNumberSelector
          value={is('Carbs')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
            is('Carbs'),
            (timestamp, amount) => ({
              modelType: 'Carbs',
              modelUuid: generateUuid(),
              timestamp,
              amount,
              carbsType: 'normal',
            }),
            amount => ({ amount }),
          )}
          min={5}
          max={100}
          step={5}
          centerOn={40}
          color={nbCarbs}
        />
        <ScrollNumberSelector
          value={is('MeterEntry')(modelBeingEdited) ? modelBeingEdited.bloodGlucose || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
            is('MeterEntry'),
            (timestamp, bloodGlucose) => ({
              modelType: 'MeterEntry',
              modelUuid: generateUuid(),
              timestamp,
              source: 'ui',
              bloodGlucose,
            }),
            bloodGlucose => ({ bloodGlucose }),
          )}
          min={1}
          max={20}
          step={0.5}
          centerOn={8}
          decimals={1}
          color={nbBg}
        />
        <ScrollNumberSelector
          value={is('Insulin')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
            is('Insulin'),
            (timestamp, amount) => ({
              modelType: 'Insulin',
              modelUuid: generateUuid(),
              timestamp,
              amount,
              insulinType: '',
            }),
            amount => ({ amount }),
          )}
          min={1}
          max={20}
          step={1}
          centerOn={5}
          color={nbInsulin}
        />
      </div>
    </div>
  );
}) as React.FC<Props>;

function createChangeHandler<T extends TimelineModel>(
  state: NavigationState,
  actions: ReduxActions,
  modelBeingEdited: Model | null,
  isModelOfCorrectType: (model: unknown) => boolean,
  modelCreateCallback: (timestamp: number, newValue: number) => T,
  modelUpdateCallback: (newValue: number) => Partial<T>,
) {
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
}
