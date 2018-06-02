import { renderFromStore } from 'nightbear/web/app/utils/react';
import DbStatusBar from 'nightbear/web/app/ui/utils/DbStatusBar';

export default renderFromStore(
  __filename,
  state => state.config,
  (React, { remoteDbUrl }, dispatch) => (
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
        onClick={() => dispatch({ type: 'TIMELINE_DATA_REQUESTED', timeRange: 1000 * 60 * 60 })}
      >
        Request timeline data
      </button>
    </div>
  ),
);
