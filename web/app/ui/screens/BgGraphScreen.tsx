import { mergeEntriesFeed } from 'core/entries/entries';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import BgGraph from 'web/app/ui/utils/BgGraph';
import ScrollNumberSelector from 'web/app/ui/utils/ScrollNumberSelector';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, state, _dispatch) => {
    if (state.selectedScreen !== 'BgGraphScreen') return null; // this screen can only be rendered if it's been selected in state
    return (
      <div className="this">
        <div className="top">
          {state.loadedModels.status === 'FETCHING' && <pre>Fetching...</pre>}
          {state.loadedModels.status === 'ERROR' && (
            <pre>Error while loading timeline models: {state.loadedModels.errorMessage}</pre>
          )}
          {state.loadedModels.status === 'READY' && (
            <BgGraph
              timelineModels={getTimelineModels(state.loadedModels.timelineModels)}
              timelineRange={state.timelineRange}
              timelineRangeEnd={state.timelineRangeEnd}
            />
          )}
        </div>
        <div className="bottom">
          <ScrollNumberSelector onChange={newValue => console.log('New value:', newValue)} />
          <ScrollNumberSelector onChange={newValue => console.log('New value:', newValue)} />
          <ScrollNumberSelector onChange={newValue => console.log('New value:', newValue)} />
        </div>
      </div>
    );
  },
);

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
