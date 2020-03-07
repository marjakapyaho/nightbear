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
  const uiNavigation = useReduxState(s => s.uiNavigation);
  const timelineData = useReduxState(s => s.timelineData);
  const actions = useReduxActions();

  if (uiNavigation.selectedScreen !== 'TimelineDebugScreen') return null; // this screen can only be rendered if it's been selected in state

  return (
    <div className="this" onClick={() => actions.TIMELINE_CURSOR_UPDATED(null)}>
      {uiNavigation.modelUuidBeingEdited && (
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
            uiNavigation.timelineRange,
            uiNavigation.timelineRangeEnd - uiNavigation.timelineRange,
            uiNavigation.selectedModelTypes,
          )
        }
      >
        Prev
      </button>
      <TimeRangeSelector
        value={uiNavigation.timelineRange}
        onChange={range =>
          actions.TIMELINE_FILTERS_CHANGED(range, uiNavigation.timelineRangeEnd, uiNavigation.selectedModelTypes)
        }
      />
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            uiNavigation.timelineRange,
            uiNavigation.timelineRangeEnd + uiNavigation.timelineRange,
            uiNavigation.selectedModelTypes,
          )
        }
      >
        Next
      </button>
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            uiNavigation.timelineRange * 2,
            uiNavigation.timelineRangeEnd + Math.round(uiNavigation.timelineRange / 2),
            uiNavigation.selectedModelTypes,
          )
        }
      >
        Zoom out
      </button>
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(uiNavigation.timelineRange, Date.now(), uiNavigation.selectedModelTypes)
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
          <Timestamp ts={uiNavigation.timelineRangeEnd - uiNavigation.timelineRange} />
        </strong>
        to
        <strong>
          <Timestamp ts={uiNavigation.timelineRangeEnd} />
        </strong>
      </p>
      <ModelTypeSelector
        multiple
        value={uiNavigation.selectedModelTypes}
        onChange={newType =>
          actions.TIMELINE_FILTERS_CHANGED(uiNavigation.timelineRange, uiNavigation.timelineRangeEnd, newType)
        }
      />
      {timelineData.status === 'FETCHING' && <pre>Fetching...</pre>}
      {timelineData.status === 'ERROR' && <pre>Error while loading timeline models: {timelineData.errorMessage}</pre>}
      {timelineData.status === 'READY' && (
        <TimelineModelGraph
          timelineModels={timelineData.timelineModels}
          selectedModelTypes={uiNavigation.selectedModelTypes}
          timelineRange={uiNavigation.timelineRange}
          timelineRangeEnd={uiNavigation.timelineRangeEnd}
          timelineCursorAt={null}
        />
      )}
      {timelineData.status === 'READY' && <TimelineModelTable models={timelineData.timelineModels} />}
    </div>
  );
};
