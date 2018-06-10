import { renderFromStore } from 'web/app/utils/react';
import DbStatusBar from 'web/app/ui/utils/DbStatusBar';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimelineModelTable from 'web/app/ui/utils/TimelineModelTable';

export default renderFromStore(
  __filename,
  state => ({
    remoteDbUrl: state.configVars.remoteDbUrl,
    timelineData: state.timelineData,
  }),
  (React, { remoteDbUrl, timelineData }, dispatch) => (
    <div>
      <DbStatusBar />
      {!!remoteDbUrl && <pre>dbUrl = {remoteDbUrl}</pre>}
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
            type: 'TIMELINE_FILTERS_CHANGED',
            range: timelineData.filters.range,
            rangeEnd: Date.now(),
            modelTypes: [newType],
          })
        }
      />
      <TimeRangeSelector
        onChange={range =>
          dispatch({
            type: 'TIMELINE_FILTERS_CHANGED',
            range,
            rangeEnd: Date.now(),
            modelTypes: timelineData.filters.modelTypes,
          })
        }
      />
      {timelineData.status === 'READY' && <TimelineModelTable models={timelineData.models} />}
      {timelineData.status !== 'READY' && timelineData.status}
    </div>
  ),
);
