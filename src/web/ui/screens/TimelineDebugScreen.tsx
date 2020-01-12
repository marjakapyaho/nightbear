import 'web/ui/screens/TimelineDebugScreen.scss';
import { useCssNs, useReduxState, useReduxDispatch } from 'web/utils/react';
import ReactModal from 'react-modal';
import { isTimelineModel } from 'core/models/utils';
import TimeRangeSelector from 'web/ui/utils/TimeRangeSelector';
import Timestamp from 'web/ui/utils/Timestamp';
import ModelTypeSelector from 'web/ui/utils/ModelTypeSelector';
import TimelineModelGraph from 'web/ui/utils/TimelineModelGraph';
import TimelineModelTable from 'web/ui/utils/TimelineModelTable';

type Props = {};

export default () => {
  const { React, ns: cssNs } = useCssNs(module.id);
  const state = useReduxState(s => s.uiNavigation);
  const actions = useReduxDispatch();

  if (state.selectedScreen !== 'TimelineDebugScreen') return null; // this screen can only be rendered if it's been selected in state
  return (
    <div className="this" onClick={() => actions.TIMELINE_CURSOR_UPDATED(null)}>
      {state.modelBeingEdited && (
        <ReactModal
          isOpen
          ariaHideApp={false}
          onRequestClose={() => actions.MODEL_SELECTED_FOR_EDITING(null)}
          portalClassName={cssNs('modalPortal')}
          overlayClassName={cssNs('modalOverlay')}
          className={cssNs('modalContent')}
        >
          <textarea className="model" defaultValue={JSON.stringify(state.modelBeingEdited, null, 2)} />
          <button onClick={() => actions.MODEL_SELECTED_FOR_EDITING(null)}>Cancel</button>
          <button
            onClick={() => {
              const txt: HTMLTextAreaElement | null = document.querySelector('.' + cssNs('model')); // TODO: Use React ref here instead
              if (!txt) return;
              if (!window.confirm('Are you sure you want to save these changes?')) return;
              console.log('New model content:', txt.value);
              const newModel = JSON.parse(txt.value);
              if (isTimelineModel(newModel)) {
                actions.MODEL_CHANGES_SAVED(newModel);
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
            state.timelineRange,
            state.timelineRangeEnd - state.timelineRange,
            state.selectedModelTypes,
          )
        }
      >
        Prev
      </button>
      <TimeRangeSelector
        value={state.timelineRange}
        onChange={range => actions.TIMELINE_FILTERS_CHANGED(range, state.timelineRangeEnd, state.selectedModelTypes)}
      />
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            state.timelineRange,
            state.timelineRangeEnd + state.timelineRange,
            state.selectedModelTypes,
          )
        }
      >
        Next
      </button>
      <button
        onClick={() =>
          actions.TIMELINE_FILTERS_CHANGED(
            state.timelineRange * 2,
            state.timelineRangeEnd + Math.round(state.timelineRange / 2),
            state.selectedModelTypes,
          )
        }
      >
        Zoom out
      </button>
      <button
        onClick={() => actions.TIMELINE_FILTERS_CHANGED(state.timelineRange, Date.now(), state.selectedModelTypes)}
      >
        Now
      </button>
      {state.timelineCursorAt &&
        state.loadedModels.status === 'READY' &&
        state.loadedModels.globalModels.map(model => (
          <button key={model.profileName} onClick={() => actions.PROFILE_ACTIVATED(model, state.timelineCursorAt || 0)}>
            Activate profile: <strong>{model.profileName}</strong>
          </button>
        ))}
      <p>
        Showing from
        <strong>
          <Timestamp ts={state.timelineRangeEnd - state.timelineRange} />
        </strong>
        to
        <strong>
          <Timestamp ts={state.timelineRangeEnd} />
        </strong>
      </p>
      <ModelTypeSelector
        multiple
        value={state.selectedModelTypes}
        onChange={newType => actions.TIMELINE_FILTERS_CHANGED(state.timelineRange, state.timelineRangeEnd, newType)}
      />
      {state.loadedModels.status === 'FETCHING' && <pre>Fetching...</pre>}
      {state.loadedModels.status === 'ERROR' && (
        <pre>Error while loading timeline models: {state.loadedModels.errorMessage}</pre>
      )}
      {state.loadedModels.status === 'READY' && (
        <TimelineModelGraph
          timelineModels={state.loadedModels.timelineModels}
          selectedModelTypes={state.selectedModelTypes}
          timelineRange={state.timelineRange}
          timelineRangeEnd={state.timelineRangeEnd}
          timelineCursorAt={state.timelineCursorAt}
        />
      )}
      {state.loadedModels.status === 'READY' && <TimelineModelTable models={state.loadedModels.timelineModels} />}
    </div>
  );
};
