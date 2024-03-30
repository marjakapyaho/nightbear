import { is } from 'shared/models/utils';
import { generateUuid } from 'shared/utils/id';
import { getEntriesFeed, getModelByUuid } from 'frontend/data/data/getters';
import { ScrollNumberSelector } from 'frontend/components/scrollNumberSelector/ScrollNumberSelector';
import { Timeline } from 'frontend/components/timeline/Timeline';
import { useReduxActions, useReduxState } from 'frontend/utils/react';
import { nbBg, nbCarbs, nbInsulin } from 'frontend/utils/colors';
import { StatusBar } from 'frontend/components/statusBar/StatusBar';
import { useEffect } from 'react';
import React from 'react';
import { createChangeHandler, getRollingAnalysisResults } from './bgGraphUtils';
import styles from './BgGraph.module.scss';

export const BgGraph = () => {
  const configState = useReduxState(s => s.config);
  const navigationState = useReduxState(s => s.navigation);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  useEffect(() => {
    actions.UI_NAVIGATED('BgGraph');
    // eslint-disable-next-line
  }, []);

  if (navigationState.selectedScreen !== 'BgGraph') return null; // this screen can only be rendered if it's been selected in state

  const { timelineRange, timelineRangeEnd } = navigationState;
  const modelBeingEdited = getModelByUuid(dataState, navigationState.modelUuidBeingEdited);
  const bgModels = getEntriesFeed(dataState);
  const activeProfiles = dataState.timelineModels.filter(is('ActiveProfile'));

  const rollingAnalysisResults = getRollingAnalysisResults(
    configState,
    dataState,
    navigationState,
    bgModels,
    activeProfiles,
    timelineRange,
    timelineRangeEnd,
  );
  console.log({ rollingAnalysisResults });

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

  return (
    <div className={styles.bgGraph}>
      <StatusBar />
      <div className={styles.bgGraphTop} style={{ height: timelineConfig.outerHeight }}>
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
          />
        )}
        {dataState.status === 'FETCHING' && <pre>Loading...</pre>}
        {dataState.status === 'ERROR' && <pre>Error: {dataState.errorMessage}</pre>}
      </div>
      <div className={styles.graphBottom}>
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
};
