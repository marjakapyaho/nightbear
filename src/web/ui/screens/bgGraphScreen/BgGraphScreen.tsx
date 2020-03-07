import { performRollingAnalysis, BUCKET_SIZE } from 'core/analyser/rolling-analysis';
import { mergeEntriesFeed } from 'core/entries/entries';
import { Model, TimelineModel } from 'core/models/model';
import { is, isTimelineModel } from 'core/models/utils';
import { generateUuid } from 'core/utils/id';
import { isEqual } from 'lodash';
import { ReduxActions } from 'web/modules/actions';
import { getModelByUuid } from 'web/modules/data/getters';
import { NavigationState } from 'web/modules/navigation/state';
import ScrollNumberSelector from 'web/ui/components/scrollNumberSelector/ScrollNumberSelector';
import Timeline from 'web/ui/components/timeline/Timeline';
import 'web/ui/screens/bgGraphScreen/BgGraphScreen.scss';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('BgGraphScreen');
  const configState = useReduxState(s => s.config);
  const navigationState = useReduxState(s => s.navigation);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  if (navigationState.selectedScreen !== 'BgGraphScreen') return null; // this screen can only be rendered if it's been selected in state

  const { timelineRange, timelineRangeEnd } = navigationState;
  const modelBeingEdited = getModelByUuid(dataState, navigationState.modelUuidBeingEdited);
  const rollingAnalysisResults =
    configState.showRollingAnalysis && dataState.status === 'READY'
      ? performRollingAnalysis(
          dataState.timelineModels,
          navigationState.timelineCursorAt ? BUCKET_SIZE : timelineRange, // if there's a cursor placed, run the analysis ONLY at that point in time; this makes debugging the analyser a lot simpler
          navigationState.timelineCursorAt || timelineRangeEnd, // ^ ditto
        )
      : undefined;
  const timelineConfig = {
    timelineRange,
    timelineRangeEnd,
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 30,
    outerHeight: 320,
    bgMin: 2,
    bgMax: 18,
    bgStep: 1,
    pixelsPerHour: 100,
  };

  return (
    <div className="this">
      <div className="top" style={{ height: timelineConfig.outerHeight }}>
        {dataState.status === 'READY' && (
          <Timeline
            timelineConfig={timelineConfig}
            cursorTimestamp={navigationState.timelineCursorAt}
            onCursorTimestampUpdate={actions.TIMELINE_CURSOR_UPDATED}
            bgModels={mergeEntriesFeed([
              dataState.timelineModels.filter(is('DexcomSensorEntry')),
              dataState.timelineModels.filter(is('DexcomRawSensorEntry')),
              dataState.timelineModels.filter(is('ParakeetSensorEntry')),
              dataState.timelineModels.filter(is('MeterEntry')),
            ])}
            selectedBgModel={is('MeterEntry')(modelBeingEdited) ? modelBeingEdited : undefined}
            onBgModelSelect={model => (is('MeterEntry')(model) ? actions.MODEL_SELECTED_FOR_EDITING(model) : undefined)} // currently, of all the BG types, we only support editing MeterEntry's, because editing the other ones wouldn't make much sense
            insulinModels={dataState.timelineModels.filter(is('Insulin'))}
            selectedInsulinModel={is('Insulin')(modelBeingEdited) ? modelBeingEdited : undefined}
            onInsulinModelSelect={actions.MODEL_SELECTED_FOR_EDITING}
            carbsModels={dataState.timelineModels.filter(is('Carbs'))}
            selectedCarbsModel={is('Carbs')(modelBeingEdited) ? modelBeingEdited : undefined}
            onCarbsModelSelect={actions.MODEL_SELECTED_FOR_EDITING}
            rollingAnalysisResults={rollingAnalysisResults}
          />
        )}
        {dataState.status === 'FETCHING' && <pre>Loading...</pre>}
        {dataState.status === 'ERROR' && <pre>Error: {dataState.errorMessage}</pre>}
      </div>
      <div className="bottom">
        <ScrollNumberSelector
          value={is('Carbs')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
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
          color="#9ad5b3"
        />
        <ScrollNumberSelector
          value={is('MeterEntry')(modelBeingEdited) ? modelBeingEdited.bloodGlucose || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
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
          color="#f8cc6f"
        />
        <ScrollNumberSelector
          value={is('Insulin')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={createChangeHandler(
            navigationState,
            actions,
            modelBeingEdited,
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
          color="#ee776e"
        />
      </div>
    </div>
  );
}) as React.FC<Props>;

function createChangeHandler<T extends TimelineModel>(
  state: NavigationState,
  actions: ReduxActions,
  modelBeingEdited: Model | null,
  modelCreateCallback: (timestamp: number, newValue: number) => T,
  modelUpdateCallback: (newValue: number) => Partial<T>,
) {
  return (newValue: number) => {
    if (modelBeingEdited) {
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
          ('timelineCursorAt' in state ? state.timelineCursorAt : null) || Date.now(), // if there's no cursor, create at the current wall clock time
          newValue,
        ),
      );
    }
  };
}
