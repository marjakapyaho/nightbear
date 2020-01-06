import { mergeEntriesFeed } from 'core/entries/entries';
import { TimelineModel } from 'core/models/model';
import { is } from 'core/models/utils';
import BgGraph from 'web/app/ui/utils/BgGraph';
import { renderFromStore } from 'web/app/utils/react';

export default renderFromStore(
  __filename,
  state => state.uiNavigation,
  (React, state, dispatch) => {
    if (state.selectedScreen !== 'BgGraphScreen') return null; // this screen can only be rendered if it's been selected in state
    return (
      <div className="this">
        {state.loadedModels.status === 'FETCHING' && <pre>Fetching...</pre>}
        {state.loadedModels.status === 'ERROR' && (
          <pre>Error while loading timeline models: {state.loadedModels.errorMessage}</pre>
        )}
        {state.loadedModels.status === 'READY' && (
          <BgGraph
            timelineModels={merge(state.loadedModels.timelineModels)}
            selectedModelTypes={state.selectedModelTypes}
            timelineRange={state.timelineRange}
            timelineRangeEnd={state.timelineRangeEnd}
            timelineCursorAt={state.timelineCursorAt}
            dispatch={dispatch}
          />
        )}
      </div>
    );
  },
);

function merge(timelineModels: TimelineModel[]) {
  return mergeEntriesFeed([
    timelineModels.filter(is('DexcomSensorEntry')),
    timelineModels.filter(is('DexcomRawSensorEntry')),
    timelineModels.filter(is('ParakeetSensorEntry')),
    timelineModels.filter(is('MeterEntry')),
  ]);
}
