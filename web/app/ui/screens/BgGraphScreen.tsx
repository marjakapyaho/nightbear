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
            timelineModels={state.loadedModels.timelineModels}
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
