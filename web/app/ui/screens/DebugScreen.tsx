import { renderFromStore } from 'web/app/utils/react';
import TimeRangeSelector from 'web/app/ui/utils/TimeRangeSelector';
import ModelTypeSelector from 'web/app/ui/utils/ModelTypeSelector';
import TimelineModelTable from 'web/app/ui/utils/TimelineModelTable';
import { actions } from 'web/app/modules/actions';
import DbStatusBar from 'web/app/ui/utils/DbStatusBar';
import LastBgUpdateBar from 'web/app/ui/utils/LastBgUpdateBar';

export default renderFromStore(
  __filename,
  state => ({
    remoteDbUrl: state.configVars.remoteDbUrl,
    timelineData: state.timelineData,
  }),
  (React, { remoteDbUrl, timelineData }, dispatch) => (
    <div className="this">
      <DbStatusBar />
      <LastBgUpdateBar />
      {!!remoteDbUrl && <pre>dbUrl = {remoteDbUrl}</pre>}
      <button
        onClick={() => dispatch(actions.DB_URL_SET(prompt('Please enter new DB URL:') || ''))}
      >
        Log in
      </button>
      <button onClick={() => dispatch(actions.DB_URL_SET(''))}>Log out</button>
      <ModelTypeSelector
        multiple
        onChange={newType =>
          dispatch(
            actions.TIMELINE_FILTERS_CHANGED(timelineData.filters.range, Date.now(), newType),
          )
        }
      />
      <TimeRangeSelector
        onChange={range =>
          dispatch(
            actions.TIMELINE_FILTERS_CHANGED(range, Date.now(), timelineData.filters.modelTypes),
          )
        }
      />
      {timelineData.status === 'READY' && <TimelineModelTable models={timelineData.models} />}
      {timelineData.status !== 'READY' && timelineData.status}
    </div>
  ),
);
