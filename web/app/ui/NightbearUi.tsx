import { renderFromStore } from 'app/utils/react';

export default renderFromStore(
  __filename,
  state => state.config,
  (React, { dbUrl }, dispatch) => (
    <div>
      {!!dbUrl && <pre>Logged in, with dbUrl = {dbUrl}</pre>}
      <button
        onClick={() =>
          dispatch({ type: 'DB_URL_SET', newDbUrl: prompt('Please enter new DB URL:') || '' })
        }
      >
        Log in
      </button>
      <button onClick={() => dispatch({ type: 'DB_URL_SET', newDbUrl: '' })}>Log out</button>
    </div>
  ),
);
