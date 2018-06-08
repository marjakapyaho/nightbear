import { renderFromStore } from 'nightbear/web/app/utils/react';
import DbStatusBar from 'nightbear/web/app/ui/utils/DbStatusBar';
import TimeRangeSelector from 'nightbear/web/app/ui/utils/TimeRangeSelector';
import ModelTypeSelector from 'nightbear/web/app/ui/utils/ModelTypeSelector';

export default renderFromStore(
  __filename,
  state => ({
    remoteDbUrl: state.config.remoteDbUrl,
    models: state.timelineData.models,
    modelTypes: state.timelineData.modelTypes,
    range: state.timelineData.range,
  }),
  (React, { remoteDbUrl, models, modelTypes, range }, dispatch) => (
    <div>
      <DbStatusBar />
      {!!remoteDbUrl && <pre>Logged in, with dbUrl = {remoteDbUrl}</pre>}
      <button
        onClick={() =>
          dispatch({ type: 'DB_URL_SET', newDbUrl: prompt('Please enter new DB URL:') || '' })
        }
      >
        Log in
      </button>
      <button onClick={() => dispatch({ type: 'DB_URL_SET', newDbUrl: '' })}>Log out</button>
      <ModelTypeSelector
        onChange={newType =>
          dispatch({
            type: 'TIMELINE_DATA_REQUESTED',
            range,
            rangeEnd: Date.now(),
            modelTypes: [newType],
          })
        }
      />
      <TimeRangeSelector
        onChange={range =>
          dispatch({ type: 'TIMELINE_DATA_REQUESTED', range, rangeEnd: Date.now(), modelTypes })
        }
      />
      <pre>{JSON.stringify(models, null, 4)}</pre>
    </div>
  ),
);
