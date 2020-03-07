import 'web/ui/screens/timelineDebugScreen/TimelineDebugScreen.scss';
import { useCssNs, useReduxState, useReduxActions } from 'web/utils/react';
import ReactModal from 'react-modal';
import { isTimelineModel } from 'core/models/utils';
import TimeRangeSelector from 'web/ui/components/timeRangeSelector/TimeRangeSelector';
import Timestamp from 'web/ui/components/timestamp/Timestamp';
import ModelTypeSelector from 'web/ui/components/modelTypeSelector/ModelTypeSelector';
import TimelineModelGraph from 'web/ui/components/timelineModelGraph/TimelineModelGraph';
import TimelineModelTable from 'web/ui/components/timelineModelTable/TimelineModelTable';

type Props = {};

export default () => {
  const { React, ns: cssNs } = useCssNs('TimelineDebugScreen');
  const navigationState = useReduxState(s => s.navigation);
  const dataState = useReduxState(s => s.data);
  const actions = useReduxActions();

  if (navigationState.selectedScreen !== 'TimelineDebugScreen') return null; // this screen can only be rendered if it's been selected in state

  return (
    <div className="this" onClick={() => actions.TIMELINE_CURSOR_UPDATED(null)}>
      {navigationState.modelUuidBeingEdited && (
        <ReactModal
          isOpen
          ariaHideApp={false}
          onRequestClose={() => actions.MODEL_SELECTED_FOR_EDITING(null)}
          portalClassName={cssNs('modalPortal')}
          overlayClassName={cssNs('modalOverlay')}
          className={cssNs('modalContent')}
        >
          <textarea
            className="model"
            defaultValue="TODO: Model editing not implemented after the Timeline refactoring, until actually needed"
          />
          <button onClick={() => actions.MODEL_SELECTED_FOR_EDITING(null)}>Cancel</button>
          <button
            onClick={() => {
              const txt: HTMLTextAreaElement | null = document.querySelector('.' + cssNs('model')); // TODO: Use React ref here instead
              if (!txt) return;
              if (!window.confirm('Are you sure you want to save these changes?')) return;
              console.log('New model content:', txt.value);
              const newModel = JSON.parse(txt.value);
              if (isTimelineModel(newModel)) {
                actions.MODEL_UPDATED_BY_USER(newModel);
                actions.MODEL_SELECTED_FOR_EDITING(null);
              } else {
                throw new Error(`Couldn't parse content as a TimelineModel`);
              }
            }}
          >
            Save
          </button>
        </ReactModal>
      )}
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
          actions.DB_URL_SET('');
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
      {dataState.status === 'READY' && (
        <TimelineModelGraph
          timelineModels={dataState.timelineModels}
          selectedModelTypes={navigationState.selectedModelTypes}
          timelineRange={navigationState.timelineRange}
          timelineRangeEnd={navigationState.timelineRangeEnd}
          timelineCursorAt={null}
        />
      )}
      {dataState.status === 'READY' && <TimelineModelTable models={dataState.timelineModels} />}
    </div>
  );
};
