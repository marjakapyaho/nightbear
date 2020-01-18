import { mergeEntriesFeed } from 'core/entries/entries';
import { is } from 'core/models/utils';
import 'web/ui/screens/BgGraphScreen.scss';
import BgGraph from 'web/ui/utils/BgGraph';
import ScrollNumberSelector from 'web/ui/utils/ScrollNumberSelector';
import { useCssNs, useReduxDispatch, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('BgGraphScreen');
  const state = useReduxState(s => s.uiNavigation);
  const { MODEL_SELECTED_FOR_EDITING, MODEL_CHANGES_SAVED, TIMELINE_CURSOR_UPDATED } = useReduxDispatch();

  const { modelBeingEdited } = state;

  return (
    <div className="this">
      <div className="top">
        {state.loadedModels.status === 'FETCHING' && <pre>Fetching...</pre>}
        {state.loadedModels.status === 'ERROR' && (
          <pre>Error while loading timeline models: {state.loadedModels.errorMessage}</pre>
        )}
        {state.loadedModels.status === 'READY' && (
          <BgGraph
            bgModels={mergeEntriesFeed([
              state.loadedModels.timelineModels.filter(is('DexcomSensorEntry')),
              state.loadedModels.timelineModels.filter(is('DexcomRawSensorEntry')),
              state.loadedModels.timelineModels.filter(is('ParakeetSensorEntry')),
              state.loadedModels.timelineModels.filter(is('MeterEntry')),
            ])}
            insulinModels={state.loadedModels.timelineModels.filter(is('Insulin'))}
            timelineRange={state.timelineRange}
            timelineRangeEnd={state.timelineRangeEnd}
            cursorAt={state.timelineCursorAt}
            onCursorUpdated={TIMELINE_CURSOR_UPDATED}
            onBgModelSelected={MODEL_SELECTED_FOR_EDITING}
            onInsulinModelSelected={MODEL_SELECTED_FOR_EDITING}
          />
        )}
      </div>
      <div className="bottom">
        <ScrollNumberSelector
          value={is('Insulin')(modelBeingEdited) ? modelBeingEdited.amount || undefined : undefined}
          onChange={newValue => {
            if (state.timelineCursorAt && !modelBeingEdited) {
              MODEL_CHANGES_SAVED({
                modelType: 'Insulin',
                timestamp: state.timelineCursorAt,
                amount: newValue,
                insulinType: '',
              });
            }
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
