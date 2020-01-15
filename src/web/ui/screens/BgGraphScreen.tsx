import { mergeEntriesFeed } from 'core/entries/entries';
import 'web/ui/screens/BgGraphScreen.scss';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import BgGraph from 'web/ui/utils/BgGraph';
import ScrollNumberSelector from 'web/ui/utils/ScrollNumberSelector';
import { useCssNs, useReduxState } from 'web/utils/react';

type Props = {};

export default (() => {
  const { React } = useCssNs('BgGraphScreen');
  const state = useReduxState(s => s.uiNavigation);

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
            timelineRange={state.timelineRange}
            timelineRangeEnd={state.timelineRangeEnd}
            timelineCursorAt={state.timelineCursorAt}
            onBgModelSelected={model => console.log('Selected BG model:', model)}
          />
        )}
      </div>
      <div className="bottom">
        <ScrollNumberSelector
          onChange={newValue => console.log('New insulin value:', newValue)}
          min={1}
          max={20}
          step={1}
          centerOn={5}
        />
        <ScrollNumberSelector
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

function getTimelineModels(timelineModels: TimelineModel[]): TimelineModel[] {
  const bgEntries: TimelineModel[] = mergeEntriesFeed([
    timelineModels.filter(is('DexcomSensorEntry')),
    timelineModels.filter(is('DexcomRawSensorEntry')),
    timelineModels.filter(is('ParakeetSensorEntry')),
    timelineModels.filter(is('MeterEntry')),
  ]);
  const insulinEntries: TimelineModel[] = timelineModels.filter(is('Insulin'));
  return bgEntries.concat(insulinEntries);
}
