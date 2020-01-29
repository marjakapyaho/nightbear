import { mergeEntriesFeed } from 'core/entries/entries';
import { is } from 'core/models/utils';
import 'web/ui/screens/BgGraphScreen.scss';
import ScrollNumberSelector from 'web/ui/utils/ScrollNumberSelector';
import Timeline from 'web/ui/utils/timeline/Timeline';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';
import { generateUuid } from 'core/utils/id';
import { getModelByUuid } from 'web/modules/uiNavigation/getters';

type Props = {};

export default (() => {
  const { React } = useCssNs('BgGraphScreen');
  const state = useReduxState(s => s.uiNavigation);
  const actions = useReduxActions();

  const { timelineRange, timelineRangeEnd } = state;
  const modelBeingEdited = getModelByUuid(state, state.modelUuidBeingEdited);

  const timelineConfig = {
    timelineRange,
    timelineRangeEnd,
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 0,
    paddingRight: 20,
    outerHeight: 400,
    bgMin: 2,
    bgMax: 18,
    bgStep: 1,
    pixelsPerHour: 100,
  };

  return (
    <div className="this">
      <div className="top">
        {state.loadedModels.status === 'READY' && (
          <Timeline
            timelineConfig={timelineConfig}
            cursorTimestamp={state.timelineCursorAt}
            onCursorTimestampUpdate={actions.TIMELINE_CURSOR_UPDATED}
            bgModels={mergeEntriesFeed([
              state.loadedModels.timelineModels.filter(is('DexcomSensorEntry')),
              state.loadedModels.timelineModels.filter(is('DexcomRawSensorEntry')),
              state.loadedModels.timelineModels.filter(is('ParakeetSensorEntry')),
              state.loadedModels.timelineModels.filter(is('MeterEntry')),
            ])}
            insulinModels={state.loadedModels.timelineModels.filter(is('Insulin'))}
            selectedInsulinModel={is('Insulin')(modelBeingEdited) ? modelBeingEdited : undefined}
            onInsulinModelSelect={actions.MODEL_SELECTED_FOR_EDITING}
          />
        )}
      </div>
      <div className="bottom">
        <ScrollNumberSelector
          value={is('Insulin')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={newValue => {
            if (state.timelineCursorAt && !modelBeingEdited) {
              // Create new
              actions.MODEL_UPDATED_BY_USER({
                modelType: 'Insulin',
                modelUuid: generateUuid(),
                timestamp: state.timelineCursorAt,
                amount: newValue,
                insulinType: '',
              });
            } else if (is('Insulin')(modelBeingEdited)) {
              // Update existing
              actions.MODEL_UPDATED_BY_USER({
                ...modelBeingEdited,
                amount: newValue,
              });
            }
            // TODO: Deleting when modelBeingEdited.amount === newValue
          }}
          min={1}
          max={20}
          step={1}
          centerOn={5}
        />
        <ScrollNumberSelector
          value={is('ParakeetSensorEntry')(modelBeingEdited) ? modelBeingEdited.bloodGlucose || undefined : undefined}
          onChange={newValue => console.log('New BG value:', newValue)}
          min={1}
          max={20}
          step={0.5}
          centerOn={8}
        />
        <ScrollNumberSelector
          onChange={newValue => console.log('New carbs value:', newValue)}
          min={5}
          max={100}
          step={5}
          centerOn={40}
        />
      </div>
    </div>
  );
}) as React.FC<Props>;
