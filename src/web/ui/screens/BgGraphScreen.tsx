import { mergeEntriesFeed } from 'core/entries/entries';
import { is } from 'core/models/utils';
import 'web/ui/screens/BgGraphScreen.scss';
import BgGraph from 'web/ui/utils/BgGraph';
import ScrollNumberSelector from 'web/ui/utils/ScrollNumberSelector';
import { useCssNs, useReduxDispatch, useReduxState } from 'web/utils/react';
import Timeline from 'web/ui/utils/timeline/Timeline';

type Props = {};

export default (() => {
  const { React } = useCssNs('BgGraphScreen');
  const state = useReduxState(s => s.uiNavigation);
  const { MODEL_SELECTED_FOR_EDITING, MODEL_CHANGES_SAVED, TIMELINE_CURSOR_UPDATED } = useReduxDispatch();

  const { modelBeingEdited, timelineRange, timelineRangeEnd } = state;

  const timelineConfig = {
    timelineRange, // how many ms worth of timeline data are we showing
    timelineRangeEnd, // what's the most recent bit of timeline data we are showing (e.g. Date.now())
    paddingTop: 10, // extra space above the BG scale lines
    paddingBottom: 40, // extra space below the BG scale lines
    paddingLeft: 0, // extra space to the left of the BG scale lines (does not move with the timeline)
    paddingRight: 20, // extra space to the right of the BG scale lines (does not move with the timeline)
    outerHeight: 400, // how much height from the layout should the whole timeline take (width is automatic)
    bgMin: 2, // lowest BG to show on the scale lines
    bgMax: 18, // highest BG to show on the scale lines
    bgStep: 1, // how often to draw a BG line
  };

  return (
    <div className="this">
      <div className="top">
        {state.loadedModels.status === 'READY' && (
          <Timeline
            timelineConfig={timelineConfig}
            bgModels={mergeEntriesFeed([
              state.loadedModels.timelineModels.filter(is('DexcomSensorEntry')),
              state.loadedModels.timelineModels.filter(is('DexcomRawSensorEntry')),
              state.loadedModels.timelineModels.filter(is('ParakeetSensorEntry')),
              state.loadedModels.timelineModels.filter(is('MeterEntry')),
            ])}
            insulinModels={state.loadedModels.timelineModels.filter(is('Insulin'))}
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
