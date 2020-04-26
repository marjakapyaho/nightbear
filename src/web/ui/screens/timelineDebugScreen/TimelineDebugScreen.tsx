import { TimelineModel } from 'core/models/model';
import { DataState } from 'web/modules/data/state';
import { NavigationState } from 'web/modules/navigation/state';
import ModelTypeSelector from 'web/ui/components/modelTypeSelector/ModelTypeSelector';
import TimelineModelTable from 'web/ui/components/timelineModelTable/TimelineModelTable';
import TimeRangeSelector from 'web/ui/components/timeRangeSelector/TimeRangeSelector';
import Timestamp from 'web/ui/components/timestamp/Timestamp';
import 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen.scss';
import { useCssNs, useReduxActions, useReduxState } from 'web/utils/react';
import { useEffect } from 'react';

type Props = {};

export default (() => {
  const { React } = useCssNs('TimelineDebugScreen');
  const navigationState = useReduxState(s => s.navigation);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  useEffect(() => {
    actions.UI_NAVIGATED('TimelineDebugScreen');
  }, [actions]);

  if (navigationState.selectedScreen !== 'TimelineDebugScreen') return null; // this screen can only be rendered if it's been selected in state

  return (
    <div className="this">
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            navigationState.timelineRange,
            navigationState.timelineRangeEnd - navigationState.timelineRange,
            navigationState.selectedModelTypes,
          )
        }
      >
        Prev
      </button>
      <TimeRangeSelector
        value={navigationState.timelineRange}
        onChange={range =>
          actions.TIMELINE_FILTERS_CHANGED(range, navigationState.timelineRangeEnd, navigationState.selectedModelTypes)
        }
      />
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            navigationState.timelineRange,
            navigationState.timelineRangeEnd + navigationState.timelineRange,
            navigationState.selectedModelTypes,
          )
        }
      >
        Next
      </button>
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            navigationState.timelineRange * 2,
            navigationState.timelineRangeEnd + Math.round(navigationState.timelineRange / 2),
            navigationState.selectedModelTypes,
          )
        }
      >
        Zoom out
      </button>
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            navigationState.timelineRange,
            Date.now(),
            navigationState.selectedModelTypes,
          )
        }
      >
        Now
      </button>
      <button
        onClick={() => {
          actions.CONFIG_UPDATED({ remoteDbUrl: '' });
          window.location.reload();
        }}
      >
        Log out
      </button>

      <p>
        Showing from
        <strong>
          <Timestamp ts={navigationState.timelineRangeEnd - navigationState.timelineRange} />
        </strong>
        to
        <strong>
          <Timestamp ts={navigationState.timelineRangeEnd} />
        </strong>
      </p>
      <ModelTypeSelector
        multiple
        value={navigationState.selectedModelTypes}
        onChange={newType =>
          actions.TIMELINE_FILTERS_CHANGED(navigationState.timelineRange, navigationState.timelineRangeEnd, newType)
        }
      />
      {dataState.status === 'FETCHING' && <pre>Fetching...</pre>}
      {dataState.status === 'ERROR' && <pre>Error while loading timeline models: {dataState.errorMessage}</pre>}
      {dataState.status === 'READY' && <TimelineModelTable models={filterTimelineModels(dataState, navigationState)} />}
    </div>
  );
}) as React.FC<Props>;

function filterTimelineModels(data: DataState, filters: NavigationState): TimelineModel[] {
  if (filters.selectedScreen !== 'TimelineDebugScreen') return [];
  const { timelineRange, timelineRangeEnd, selectedModelTypes } = filters;
  return data.timelineModels.filter(
    model =>
      model.timestamp >= timelineRangeEnd - timelineRange &&
      model.timestamp < timelineRangeEnd &&
      selectedModelTypes.includes(model.modelType),
  );
}
