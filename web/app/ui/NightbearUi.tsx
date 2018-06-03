import { renderFromStore } from 'nightbear/web/app/utils/react';
import DbStatusBar from 'nightbear/web/app/ui/utils/DbStatusBar';

export default renderFromStore(
  __filename,
  state => ({
    remoteDbUrl: state.config.remoteDbUrl,
    models: state.timelineData.models,
  }),
  (React, { remoteDbUrl, models }, dispatch) => (
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
      <button
        onClick={() =>
          dispatch({ type: 'TIMELINE_DATA_REQUESTED', range: 1000 * 60 * 60, rangeEnd: Date.now() })
        }
      >
        Request timeline data
      </button>
      <pre>{JSON.stringify(models, null, 4)}</pre>
    </div>
  ),
);
